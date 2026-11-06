-- Só o serviço de pagamento pode alterar status / plan_type do perfil

CREATE OR REPLACE FUNCTION public.guard_profile_plan_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF session_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
      RAISE EXCEPTION 'apenas o servico de pagamento pode alterar status ou plan_type';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_plan_fields ON public.profiles;
CREATE TRIGGER guard_profile_plan_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_plan_fields();