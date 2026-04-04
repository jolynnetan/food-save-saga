CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS text
LANGUAGE sql
SET search_path = public
AS $$
  SELECT upper(substr(md5(gen_random_uuid()::text), 1, 8));
$$;