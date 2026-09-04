ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS roteiro text,
  ADD COLUMN IF NOT EXISTS referencias text,
  ADD COLUMN IF NOT EXISTS cronograma text;