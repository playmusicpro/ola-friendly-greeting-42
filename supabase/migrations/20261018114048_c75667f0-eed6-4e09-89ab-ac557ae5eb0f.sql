GRANT SELECT ON public.profiles, public.shows, public.notification_logs TO authenticated;
CREATE TABLE public.admin_operations (
 id text PRIMARY KEY, kind text NOT NULL, title text NOT NULL, description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending', responsible text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '', frequency text, last_completed_at timestamptz, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_operations TO authenticated;
GRANT ALL ON public.admin_operations TO service_role;
ALTER TABLE public.admin_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_operations_admin ON public.admin_operations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER admin_operations_updated BEFORE UPDATE ON public.admin_operations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.admin_audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, subject_user_id uuid, resource text NOT NULL, record_id text NOT NULL, action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_audit_logs_read ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE OR REPLACE FUNCTION public.record_admin_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
 IF TG_OP='DELETE' THEN r:=to_jsonb(OLD); ELSE r:=to_jsonb(NEW); END IF;
 INSERT INTO public.admin_audit_logs(actor_id,subject_user_id,resource,record_id,action) VALUES(auth.uid(),CASE WHEN TG_TABLE_NAME='profiles' THEN (r->>'id')::uuid ELSE (r->>'user_id')::uuid END,TG_TABLE_NAME,r->>'id',TG_OP);
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.record_admin_audit() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER profiles_admin_audit AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit();
CREATE TRIGGER shows_admin_audit AFTER INSERT OR UPDATE OR DELETE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit();
CREATE TRIGGER operations_admin_audit AFTER INSERT OR UPDATE OR DELETE ON public.admin_operations FOR EACH ROW EXECUTE FUNCTION public.record_admin_audit();
CREATE INDEX admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);