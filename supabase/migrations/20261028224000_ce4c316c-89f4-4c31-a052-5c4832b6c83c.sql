REVOKE ALL ON public.my_musicians FROM anon;
COMMENT ON TABLE public.my_musicians IS 'Músicos salvos do usuário para autocomplete no cadastro de shows. Acesso restrito ao proprietário via RLS.';