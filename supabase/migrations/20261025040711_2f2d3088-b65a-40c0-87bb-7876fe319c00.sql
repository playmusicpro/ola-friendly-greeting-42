CREATE OR REPLACE FUNCTION public.guard_cash_history() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF TG_TABLE_NAME='expenses' THEN
 IF current_user IN ('authenticated','anon') THEN
 IF TG_OP='INSERT' AND NEW.origin IS NOT NULL THEN RAISE EXCEPTION 'Origem automática é gerenciada pelo show'; END IF;
 IF TG_OP='UPDATE' AND (OLD.origin IS NOT NULL OR NEW.origin IS NOT NULL) THEN RAISE EXCEPTION 'Edite o pagamento da equipe no show'; END IF;
 END IF; RETURN NEW;
 END IF;
 IF TG_OP='DELETE' AND TG_TABLE_NAME='financial_goals' AND EXISTS(SELECT 1 FROM public.financial_goal_transactions WHERE goal_id=OLD.id) THEN RAISE EXCEPTION 'Meta com histórico financeiro não pode ser excluída'; END IF;
 IF TG_OP='DELETE' AND TG_TABLE_NAME='piggy_banks' AND EXISTS(SELECT 1 FROM public.piggy_bank_transactions WHERE piggy_bank_id=OLD.id) THEN RAISE EXCEPTION 'Cofrinho com histórico financeiro não pode ser excluído'; END IF;
 RETURN OLD; END $$;