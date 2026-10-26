CREATE TABLE public.app_user_activity (user_id uuid PRIMARY KEY, last_active_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.app_user_activity TO authenticated;
GRANT ALL ON public.app_user_activity TO service_role;
ALTER TABLE public.app_user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY activity_read ON public.app_user_activity FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE TRIGGER app_activity_updated BEFORE UPDATE ON public.app_user_activity FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.app_usage_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, module text NOT NULL, event_kind text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.app_usage_logs TO authenticated;
GRANT ALL ON public.app_usage_logs TO service_role;
ALTER TABLE public.app_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_admin_read ON public.app_usage_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX app_usage_date_module ON public.app_usage_logs (created_at DESC, module);
CREATE INDEX app_activity_last_active ON public.app_user_activity (last_active_at);
CREATE OR REPLACE FUNCTION public.record_app_usage(p_module text DEFAULT NULL, p_event_kind text DEFAULT 'navigation') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor uuid := auth.uid();
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_event_kind NOT IN ('navigation','action','app_open') OR p_event_kind IS NULL THEN RAISE EXCEPTION 'Invalid event kind'; END IF;
 IF p_module IS NOT NULL AND p_module NOT IN ('agenda','finance','repertoire','prompts','maps') THEN RAISE EXCEPTION 'Invalid module'; END IF;
 INSERT INTO public.app_user_activity (user_id, last_active_at) VALUES (actor, now()) ON CONFLICT (user_id) DO UPDATE SET last_active_at = EXCLUDED.last_active_at;
 IF p_module IS NOT NULL THEN INSERT INTO public.app_usage_logs (user_id,module,event_kind) VALUES (actor,p_module,p_event_kind); END IF;
END $$;
REVOKE ALL ON FUNCTION public.record_app_usage(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_app_usage(text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_module_usage(p_since timestamptz) RETURNS TABLE(module text, accesses bigint, users_count bigint) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Administrator required'; END IF;
 RETURN QUERY SELECT l.module, count(*), count(DISTINCT l.user_id) FROM public.app_usage_logs l WHERE l.created_at >= p_since GROUP BY l.module;
END $$;
REVOKE ALL ON FUNCTION public.admin_module_usage(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_module_usage(timestamptz) TO authenticated;