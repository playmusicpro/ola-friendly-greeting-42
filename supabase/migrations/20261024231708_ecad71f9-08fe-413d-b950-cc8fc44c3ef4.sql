CREATE OR REPLACE FUNCTION public.guard_goal_adjustment() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
 IF current_user IN ('authenticated','anon') AND ((TG_OP='INSERT' AND NEW.saldo_ajuste <> 0) OR (TG_OP='UPDATE' AND NEW.saldo_ajuste IS DISTINCT FROM OLD.saldo_ajuste)) THEN RAISE EXCEPTION 'Use aporte ou resgate para movimentar a meta'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_goal_adjustment BEFORE INSERT OR UPDATE ON public.financial_goals FOR EACH ROW EXECUTE FUNCTION public.guard_goal_adjustment();