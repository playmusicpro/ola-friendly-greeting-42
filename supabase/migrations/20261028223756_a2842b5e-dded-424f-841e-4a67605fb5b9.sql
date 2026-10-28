CREATE TABLE public.my_musicians (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  instrument text NOT NULL DEFAULT '',
  default_fee numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.my_musicians TO authenticated;
GRANT ALL ON public.my_musicians TO service_role;
ALTER TABLE public.my_musicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own saved musicians" ON public.my_musicians FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_my_musicians_updated_at BEFORE UPDATE ON public.my_musicians FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();