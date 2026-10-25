ALTER TABLE public.shows ADD COLUMN contractor text;
COMMENT ON COLUMN public.shows.contractor IS 'Nome do contratante do evento, informado no cadastro completo de show';