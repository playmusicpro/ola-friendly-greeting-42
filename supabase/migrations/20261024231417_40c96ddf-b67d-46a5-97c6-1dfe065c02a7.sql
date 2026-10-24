REVOKE ALL ON public.financial_goal_transactions FROM anon, authenticated;
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
ALTER FUNCTION public.move_financial_goal(uuid,numeric,text) SET SCHEMA private;
CREATE FUNCTION public.move_financial_goal(p_goal_id uuid,p_valor numeric,p_tipo text) RETURNS numeric LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT private.move_financial_goal(p_goal_id,p_valor,p_tipo); $$;
REVOKE ALL ON FUNCTION public.move_financial_goal(uuid,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.move_financial_goal(uuid,numeric,text) TO authenticated;