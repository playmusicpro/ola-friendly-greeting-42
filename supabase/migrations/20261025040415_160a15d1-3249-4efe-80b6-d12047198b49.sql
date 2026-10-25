CREATE OR REPLACE FUNCTION public.guard_cash_history() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF TG_TABLE_NAME='expenses' AND current_user IN ('authenticated','anon') THEN
 IF TG_OP='INSERT' AND NEW.origin IS NOT NULL THEN RAISE EXCEPTION 'Origem automática é gerenciada pelo show'; END IF;
 IF TG_OP='UPDATE' AND (OLD.origin IS NOT NULL OR NEW.origin IS NOT NULL) THEN RAISE EXCEPTION 'Edite o pagamento da equipe no show'; END IF;
 RETURN NEW;
 END IF;
 IF TG_OP='DELETE' AND TG_TABLE_NAME='financial_goals' AND EXISTS(SELECT 1 FROM public.financial_goal_transactions WHERE goal_id=OLD.id) THEN RAISE EXCEPTION 'Meta com histórico financeiro não pode ser excluída'; END IF;
 IF TG_OP='DELETE' AND TG_TABLE_NAME='piggy_banks' AND EXISTS(SELECT 1 FROM public.piggy_bank_transactions WHERE piggy_bank_id=OLD.id) THEN RAISE EXCEPTION 'Cofrinho com histórico financeiro não pode ser excluído'; END IF;
 RETURN OLD; END $$;
CREATE TRIGGER guard_cash_origin BEFORE INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.guard_cash_history();
CREATE TRIGGER guard_goal_history BEFORE DELETE ON public.financial_goals FOR EACH ROW EXECUTE FUNCTION public.guard_cash_history();
CREATE TRIGGER guard_bank_history BEFORE DELETE ON public.piggy_banks FOR EACH ROW EXECUTE FUNCTION public.guard_cash_history();
REVOKE ALL ON FUNCTION public.guard_cash_history() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.guard_cash_history() TO authenticated;