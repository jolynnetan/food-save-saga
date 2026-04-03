
-- 1. Fix food_drop claim: replace permissive UPDATE policy with a secure RPC
DROP POLICY IF EXISTS "claim_food_drop" ON public.food_drops;

CREATE OR REPLACE FUNCTION public.claim_food_drop(drop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE food_drops
  SET status = 'claimed', claimed_by = auth.uid()
  WHERE id = drop_id
    AND status = 'available'
    AND user_id <> auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Food drop not available or cannot be claimed';
  END IF;
END;
$$;

-- 2. Re-scope all public-role policies to authenticated

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON public.user_recipes;
CREATE POLICY "Users can view own recipes" ON public.user_recipes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own recipes" ON public.user_recipes;
CREATE POLICY "Users can insert own recipes" ON public.user_recipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own recipes" ON public.user_recipes;
CREATE POLICY "Users can update own recipes" ON public.user_recipes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own recipes" ON public.user_recipes;
CREATE POLICY "Users can delete own recipes" ON public.user_recipes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- calorie_entries
DROP POLICY IF EXISTS "Users can view own calorie entries" ON public.calorie_entries;
CREATE POLICY "Users can view own calorie entries" ON public.calorie_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own calorie entries" ON public.calorie_entries;
CREATE POLICY "Users can insert own calorie entries" ON public.calorie_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own calorie entries" ON public.calorie_entries;
CREATE POLICY "Users can update own calorie entries" ON public.calorie_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own calorie entries" ON public.calorie_entries;
CREATE POLICY "Users can delete own calorie entries" ON public.calorie_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- scan_results
DROP POLICY IF EXISTS "Users can view own scan results" ON public.scan_results;
CREATE POLICY "Users can view own scan results" ON public.scan_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own scan results" ON public.scan_results;
CREATE POLICY "Users can insert own scan results" ON public.scan_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own scan results" ON public.scan_results;
CREATE POLICY "Users can update own scan results" ON public.scan_results FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own scan results" ON public.scan_results;
CREATE POLICY "Users can delete own scan results" ON public.scan_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- pantry_items
DROP POLICY IF EXISTS "Users can view own pantry items" ON public.pantry_items;
CREATE POLICY "Users can view own pantry items" ON public.pantry_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own pantry items" ON public.pantry_items;
CREATE POLICY "Users can insert own pantry items" ON public.pantry_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own pantry items" ON public.pantry_items;
CREATE POLICY "Users can update own pantry items" ON public.pantry_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own pantry items" ON public.pantry_items;
CREATE POLICY "Users can delete own pantry items" ON public.pantry_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- food_tracker_entries
DROP POLICY IF EXISTS "Users can view own food tracker entries" ON public.food_tracker_entries;
CREATE POLICY "Users can view own food tracker entries" ON public.food_tracker_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own food tracker entries" ON public.food_tracker_entries;
CREATE POLICY "Users can insert own food tracker entries" ON public.food_tracker_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own food tracker entries" ON public.food_tracker_entries;
CREATE POLICY "Users can update own food tracker entries" ON public.food_tracker_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own food tracker entries" ON public.food_tracker_entries;
CREATE POLICY "Users can delete own food tracker entries" ON public.food_tracker_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_activities
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own activities" ON public.user_activities;
CREATE POLICY "Users can update own activities" ON public.user_activities FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own activities" ON public.user_activities;
CREATE POLICY "Users can delete own activities" ON public.user_activities FOR DELETE TO authenticated USING (auth.uid() = user_id);
