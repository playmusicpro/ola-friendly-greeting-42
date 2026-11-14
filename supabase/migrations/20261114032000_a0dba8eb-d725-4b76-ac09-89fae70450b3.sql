CREATE OR REPLACE FUNCTION public.admin_set_user_vip(p_user_id uuid, p_is_vip boolean, p_expires_at timestamptz, p_notes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'apenas administradores podem alterar o acesso VIP';
  END IF;
  IF p_is_vip AND p_expires_at IS NOT NULL AND p_expires_at <= now() THEN
    RAISE EXCEPTION 'a validade do VIP precisa ser uma data futura';
  END IF;
  UPDATE public.profiles
     SET is_vip = p_is_vip,
         vip_expires_at = CASE WHEN p_is_vip THEN p_expires_at ELSE NULL END,
         vip_notes = NULLIF(left(trim(coalesce(p_notes, '')), 200), '')
   WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'usuário não encontrado'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_user_vip(uuid, boolean, timestamptz, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_vip(uuid, boolean, timestamptz, text) TO authenticated;