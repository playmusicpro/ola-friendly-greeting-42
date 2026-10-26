CREATE OR REPLACE FUNCTION private.reset_user_data(p_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE uid uuid := auth.uid(); mail text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Sessão expirada. Entre novamente.'; END IF;
 SELECT email INTO mail FROM auth.users WHERE id = uid;
 IF mail IS NULL OR lower(trim(p_email)) <> lower(mail) THEN RAISE EXCEPTION 'O e-mail informado não corresponde à sua conta'; END IF;
 DELETE FROM public.setlist_songs WHERE user_id = uid;
 DELETE FROM public.setlists WHERE user_id = uid;
 DELETE FROM public.songs WHERE user_id = uid;
 DELETE FROM public.events WHERE user_id = uid;
 DELETE FROM public.expenses WHERE user_id = uid;
 DELETE FROM public.financial_goal_transactions WHERE user_id = uid;
 DELETE FROM public.financial_goals WHERE user_id = uid;
 DELETE FROM public.piggy_bank_transactions WHERE user_id = uid;
 DELETE FROM public.piggy_banks WHERE user_id = uid;
 DELETE FROM public.fixed_expenses WHERE user_id = uid;
 DELETE FROM public.incomes WHERE user_id = uid;
 DELETE FROM public.projects WHERE user_id = uid;
 DELETE FROM public.notification_logs WHERE user_id = uid;
 DELETE FROM public.shows WHERE user_id = uid;
END $$;
REVOKE ALL ON FUNCTION private.reset_user_data(text) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.reset_user_data(text) TO authenticated;
CREATE OR REPLACE FUNCTION public.reset_user_data(p_email text)
RETURNS void LANGUAGE sql SET search_path TO '' AS $$ SELECT private.reset_user_data(p_email); $$;
REVOKE ALL ON FUNCTION public.reset_user_data(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reset_user_data(text) TO authenticated;