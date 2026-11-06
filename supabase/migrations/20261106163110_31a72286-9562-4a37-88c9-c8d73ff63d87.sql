CREATE OR REPLACE FUNCTION public.guard_profile_plan_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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