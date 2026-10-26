CREATE TABLE public.show_musicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  show_id uuid NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  name text NOT NULL,
  instrument text NOT NULL DEFAULT '',
  cache numeric NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  paid_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.show_musicians TO authenticated;
GRANT ALL ON public.show_musicians TO service_role;
ALTER TABLE public.show_musicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage show musicians" ON public.show_musicians FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.shows s WHERE s.id = show_id AND s.user_id = auth.uid()));
CREATE INDEX show_musicians_show_idx ON public.show_musicians(show_id);

CREATE OR REPLACE FUNCTION public.validate_show_musician() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.name := btrim(NEW.name);
  IF NEW.name = '' OR length(NEW.name) > 120 THEN RAISE EXCEPTION 'Nome do músico inválido'; END IF;
  IF length(NEW.instrument) > 80 THEN RAISE EXCEPTION 'Instrumento muito longo'; END IF;
  IF NEW.cache < 0 THEN RAISE EXCEPTION 'Cachê não pode ser negativo'; END IF;
  IF NEW.paid AND NEW.paid_date IS NULL THEN NEW.paid_date := current_date; END IF;
  IF NOT NEW.paid THEN NEW.paid_date := NULL; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER validate_show_musician BEFORE INSERT OR UPDATE ON public.show_musicians FOR EACH ROW EXECUTE FUNCTION public.validate_show_musician();

CREATE OR REPLACE FUNCTION public.sync_show_musician_cash() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_title text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.expenses WHERE show_id = OLD.show_id AND origin = 'musician:' || OLD.id AND user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  IF NEW.paid AND NEW.cache > 0 THEN
    SELECT coalesce(title, local) INTO v_title FROM public.shows WHERE id = NEW.show_id AND user_id = NEW.user_id;
    IF v_title IS NULL THEN RAISE EXCEPTION 'Show não encontrado'; END IF;
    INSERT INTO public.expenses(user_id, show_id, descricao, categoria, valor, data, origin)
    VALUES (NEW.user_id, NEW.show_id, 'Cachê ' || NEW.name || ' · ' || v_title, 'musicos', NEW.cache, NEW.paid_date, 'musician:' || NEW.id)
    ON CONFLICT (show_id, origin) WHERE origin IS NOT NULL DO UPDATE SET valor = excluded.valor, data = excluded.data, descricao = excluded.descricao;
  ELSE
    DELETE FROM public.expenses WHERE show_id = NEW.show_id AND origin = 'musician:' || NEW.id AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.sync_show_musician_cash() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER sync_show_musician_cash AFTER INSERT OR UPDATE OR DELETE ON public.show_musicians FOR EACH ROW EXECUTE FUNCTION public.sync_show_musician_cash();