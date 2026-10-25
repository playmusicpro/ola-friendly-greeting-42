ALTER TABLE public.shows ADD COLUMN cash_tracking boolean NOT NULL DEFAULT false, ADD COLUMN deposit_amount numeric NOT NULL DEFAULT 0, ADD COLUMN deposit_received boolean NOT NULL DEFAULT false, ADD COLUMN deposit_date date, ADD COLUMN settled boolean NOT NULL DEFAULT false, ADD COLUMN settlement_date date, ADD COLUMN deduct_team boolean NOT NULL DEFAULT false, ADD COLUMN team_payment_date date;
ALTER TABLE public.expenses ADD COLUMN origin text;
CREATE UNIQUE INDEX expenses_show_origin_unique ON public.expenses(show_id,origin) WHERE origin IS NOT NULL;
CREATE OR REPLACE FUNCTION public.validate_show_cash() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF NEW.cash_tracking THEN
 IF NEW.cache < 0 OR NEW.deposit_amount < 0 OR NEW.deposit_amount > NEW.cache OR NEW.deposit_amount <> round(NEW.deposit_amount,2) OR NEW.deposit_amount::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Sinal deve estar entre zero e o cachê, com até duas casas decimais'; END IF;
 IF NEW.deposit_received AND NEW.deposit_date IS NULL THEN RAISE EXCEPTION 'Informe a data de recebimento do sinal'; END IF;
 IF NEW.settled AND NEW.settlement_date IS NULL THEN RAISE EXCEPTION 'Informe a data da quitação'; END IF;
 IF NEW.deduct_team AND NEW.team_payment_date IS NULL THEN RAISE EXCEPTION 'Informe a data do pagamento da equipe'; END IF;
 END IF; RETURN NEW; END $$;
CREATE TRIGGER validate_show_cash BEFORE INSERT OR UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.validate_show_cash();
CREATE OR REPLACE FUNCTION public.sync_show_team_cash() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NEW.cash_tracking THEN
 IF NEW.deduct_team AND NEW.pagamento_musicos > 0 THEN
 INSERT INTO public.expenses(user_id,show_id,descricao,categoria,valor,data,origin) VALUES(NEW.user_id,NEW.id,'Cachê da Equipe/Músicos · '||coalesce(NEW.title,NEW.local),'musicos',NEW.pagamento_musicos,NEW.team_payment_date,'team_payment') ON CONFLICT(show_id,origin) WHERE origin IS NOT NULL DO UPDATE SET valor=excluded.valor,data=excluded.data,descricao=excluded.descricao;
 ELSE DELETE FROM public.expenses WHERE show_id=NEW.id AND origin='team_payment' AND user_id=NEW.user_id; END IF;
 END IF; RETURN NEW; END $$;
CREATE TRIGGER sync_show_team_cash AFTER INSERT OR UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.sync_show_team_cash();
CREATE OR REPLACE FUNCTION private.move_financial_goal(p_goal_id uuid,p_valor numeric,p_tipo text) RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE g public.financial_goals; adjustment numeric; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sessão inválida'; END IF;
 IF p_valor IS NULL OR p_valor<=0 OR p_valor<>round(p_valor,2) OR p_valor::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Informe um valor positivo com até duas casas decimais'; END IF;
 IF p_tipo IS NULL OR p_tipo NOT IN ('deposito','retirada') THEN RAISE EXCEPTION 'Movimento inválido'; END IF;
 SELECT * INTO g FROM public.financial_goals WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Meta não encontrada'; END IF;
 IF p_tipo='retirada' AND p_valor>greatest(0,g.saldo_ajuste) THEN RAISE EXCEPTION 'Resgate superior ao valor reservado na meta'; END IF;
 adjustment:=g.saldo_ajuste+CASE WHEN p_tipo='deposito' THEN p_valor ELSE -p_valor END;
 UPDATE public.financial_goals SET saldo_ajuste=adjustment WHERE id=g.id;
 INSERT INTO public.financial_goal_transactions(user_id,goal_id,tipo,valor) VALUES(auth.uid(),g.id,p_tipo,p_valor);
 RETURN adjustment; END $$;
CREATE OR REPLACE FUNCTION private.move_piggy_bank(p_bank_id uuid,p_valor numeric,p_tipo text) RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE b public.piggy_banks; balance numeric; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sessão inválida'; END IF;
 IF p_valor IS NULL OR p_valor<=0 OR p_valor<>round(p_valor,2) OR p_valor::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Informe um valor positivo com até duas casas decimais'; END IF;
 IF p_tipo IS NULL OR p_tipo NOT IN ('deposito','retirada') THEN RAISE EXCEPTION 'Movimento inválido'; END IF;
 SELECT * INTO b FROM public.piggy_banks WHERE id=p_bank_id AND user_id=auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cofrinho não encontrado'; END IF;
 IF p_tipo='retirada' AND p_valor>b.valor_atual THEN RAISE EXCEPTION 'Retirada superior ao saldo do cofrinho'; END IF;
 balance:=b.valor_atual+CASE WHEN p_tipo='deposito' THEN p_valor ELSE -p_valor END;
 UPDATE public.piggy_banks SET valor_atual=balance WHERE id=b.id;
 INSERT INTO public.piggy_bank_transactions(user_id,piggy_bank_id,tipo,valor,data) VALUES(auth.uid(),b.id,p_tipo,p_valor,(now() AT TIME ZONE 'America/Sao_Paulo')::date);
 RETURN balance; END $$;
REVOKE ALL ON FUNCTION private.move_piggy_bank(uuid,numeric,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.move_piggy_bank(uuid,numeric,text) TO authenticated;
CREATE FUNCTION public.move_piggy_bank(p_bank_id uuid,p_valor numeric,p_tipo text) RETURNS numeric LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT private.move_piggy_bank(p_bank_id,p_valor,p_tipo); $$;
REVOKE ALL ON FUNCTION public.move_piggy_bank(uuid,numeric,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.move_piggy_bank(uuid,numeric,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.guard_piggy_balance() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN IF current_user IN ('authenticated','anon') AND ((TG_OP='INSERT' AND NEW.valor_atual<>0) OR (TG_OP='UPDATE' AND NEW.valor_atual IS DISTINCT FROM OLD.valor_atual)) THEN RAISE EXCEPTION 'Use depósito ou retirada para movimentar o cofrinho'; END IF; RETURN NEW; END $$;
CREATE TRIGGER guard_piggy_balance BEFORE INSERT OR UPDATE ON public.piggy_banks FOR EACH ROW EXECUTE FUNCTION public.guard_piggy_balance();
DROP POLICY piggy_bank_transactions_owner_all ON public.piggy_bank_transactions;
CREATE POLICY piggy_bank_transactions_owner_read ON public.piggy_bank_transactions FOR SELECT TO authenticated USING (user_id=auth.uid());
REVOKE INSERT,UPDATE,DELETE ON public.piggy_bank_transactions FROM authenticated;
REVOKE ALL ON FUNCTION public.sync_show_team_cash() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.validate_show_cash() FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.guard_piggy_balance() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.validate_show_cash(),public.guard_piggy_balance() TO authenticated;