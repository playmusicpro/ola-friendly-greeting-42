CREATE OR REPLACE FUNCTION private.delete_financial_goal(p_goal_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE g public.financial_goals;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sessão expirada. Faça login novamente.'; END IF;
  SELECT * INTO g FROM public.financial_goals WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Meta não encontrada.'; END IF;
  IF g.saldo_ajuste > 0 THEN RAISE EXCEPTION 'Resgate o valor reservado antes de excluir a meta.'; END IF;
  DELETE FROM public.financial_goal_transactions WHERE goal_id=g.id AND user_id=auth.uid();
  DELETE FROM public.financial_goals WHERE id=g.id;
END $$;
REVOKE ALL ON FUNCTION private.delete_financial_goal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.delete_financial_goal(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.delete_financial_goal(p_goal_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT private.delete_financial_goal(p_goal_id); $$;
REVOKE ALL ON FUNCTION public.delete_financial_goal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_financial_goal(uuid) TO authenticated;