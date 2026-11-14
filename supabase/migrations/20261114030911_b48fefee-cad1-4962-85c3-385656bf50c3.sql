ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_vip boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vip_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS vip_notes text;

CREATE OR REPLACE FUNCTION public.guard_profile_plan_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF session_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
    IF TG_OP = 'INSERT' THEN
      IF NOT public.is_admin(auth.uid()) THEN
        NEW.is_vip := false; NEW.vip_expires_at := NULL; NEW.vip_notes := NULL;
      END IF;
      RETURN NEW;
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
      RAISE EXCEPTION 'apenas o servico de pagamento pode alterar status ou plan_type';
    END IF;
    IF (NEW.is_vip IS DISTINCT FROM OLD.is_vip OR NEW.vip_expires_at IS DISTINCT FROM OLD.vip_expires_at OR NEW.vip_notes IS DISTINCT FROM OLD.vip_notes)
       AND NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'apenas administradores podem alterar o acesso VIP';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_plan_fields ON public.profiles;
CREATE TRIGGER guard_profile_plan_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_plan_fields();