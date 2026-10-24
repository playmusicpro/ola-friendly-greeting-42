ALTER TABLE public.financial_goals ADD COLUMN saldo_ajuste numeric NOT NULL DEFAULT 0;
ALTER TABLE public.shows ADD COLUMN title text, ADD COLUMN address text, ADD COLUMN notes text, ADD COLUMN end_time text;
CREATE TABLE public.financial_goal_transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, goal_id uuid NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE, tipo text NOT NULL, valor numeric NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.financial_goal_transactions TO authenticated;
GRANT ALL ON public.financial_goal_transactions TO service_role;
ALTER TABLE public.financial_goal_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY goal_transactions_owner_read ON public.financial_goal_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER goal_transactions_updated BEFORE UPDATE ON public.financial_goal_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE FUNCTION public.move_financial_goal(p_goal_id uuid, p_valor numeric, p_tipo text) RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.financial_goals; start_day date; end_day date; today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date; earned numeric; other_income numeric; balance numeric; adjustment numeric;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sessão inválida'; END IF;
 IF p_valor IS NULL OR p_valor <= 0 OR p_valor::text IN ('NaN','Infinity','-Infinity') OR p_valor <> round(p_valor,2) THEN RAISE EXCEPTION 'Informe um valor positivo com até duas casas decimais'; END IF;
 IF p_tipo IS NULL OR p_tipo NOT IN ('deposito','retirada') THEN RAISE EXCEPTION 'Movimento inválido'; END IF;
 SELECT * INTO g FROM public.financial_goals WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Meta não encontrada'; END IF;
 IF g.periodo = 'semanal' THEN start_day := date_trunc('week',today)::date; end_day := start_day+6; ELSE start_day := date_trunc('month',today)::date; end_day := (start_day+interval '1 month'-interval '1 day')::date; END IF;
 SELECT coalesce(sum(cache-combustivel-pedagio-roupas-equipamentos-consumacao-pagamento_musicos-outros_custos),0) INTO earned FROM public.shows WHERE user_id=auth.uid() AND realizado AND date BETWEEN start_day AND end_day;
 SELECT coalesce(sum(valor),0) INTO other_income FROM public.incomes WHERE user_id=auth.uid() AND data BETWEEN start_day AND end_day;
 balance := earned+other_income+g.saldo_ajuste;
 IF p_tipo='retirada' AND p_valor > greatest(0,balance) THEN RAISE EXCEPTION 'Resgate superior ao saldo disponível'; END IF;
 adjustment := g.saldo_ajuste + CASE WHEN p_tipo='deposito' THEN p_valor ELSE -p_valor END;
 UPDATE public.financial_goals SET saldo_ajuste=adjustment WHERE id=g.id AND user_id=auth.uid();
 INSERT INTO public.financial_goal_transactions(user_id,goal_id,tipo,valor) VALUES(auth.uid(),g.id,p_tipo,p_valor);
 RETURN adjustment;
END $$;
REVOKE ALL ON FUNCTION public.move_financial_goal(uuid,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.move_financial_goal(uuid,numeric,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.validate_fixed_expense() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
 IF NEW.valor <= 0 OR NEW.valor::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Valor deve ser positivo'; END IF;
 IF NEW.dia_vencimento < 1 OR NEW.dia_vencimento > 31 THEN RAISE EXCEPTION 'Vencimento deve estar entre 1 e 31'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_fixed_expense BEFORE INSERT OR UPDATE ON public.fixed_expenses FOR EACH ROW EXECUTE FUNCTION public.validate_fixed_expense();
CREATE INDEX IF NOT EXISTS shows_owner_next_date ON public.shows(user_id,date,time) WHERE realizado=false;