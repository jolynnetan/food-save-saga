
-- 1. Missing UPDATE policies
CREATE POLICY "Users can update own calorie entries"
  ON public.calorie_entries FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan results"
  ON public.scan_results FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.user_activities FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food tracker entries"
  ON public.food_tracker_entries FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own restock logs"
  ON public.restock_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own restock logs"
  ON public.restock_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own food collections"
  ON public.food_collections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food collections"
  ON public.food_collections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix food_drops posted_by_name spoofing - use a trigger to enforce server-side name
CREATE OR REPLACE FUNCTION public.set_food_drop_posted_by_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT COALESCE(display_name, 'Anonymous')
  INTO NEW.posted_by_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF NEW.posted_by_name IS NULL THEN
    NEW.posted_by_name := 'Anonymous';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_food_drop_name
  BEFORE INSERT ON public.food_drops
  FOR EACH ROW
  EXECUTE FUNCTION public.set_food_drop_posted_by_name();

-- 3. Fix restock-photos storage policies - scope to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload restock photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view restock photos" ON storage.objects;

CREATE POLICY "Users can upload own restock photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'restock-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own restock photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'restock-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
