
-- Fix food_drops: drop overly permissive UPDATE policy and replace with scoped ones
DROP POLICY IF EXISTS "Users can claim available food drops" ON public.food_drops;

-- Owner can update their own food drops
CREATE POLICY "owner_update_food_drop" ON public.food_drops
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Other users can only claim available drops
CREATE POLICY "claim_food_drop" ON public.food_drops
  FOR UPDATE TO authenticated
  USING (status = 'available' AND auth.uid() != user_id)
  WITH CHECK (
    claimed_by = auth.uid() AND
    status = 'claimed'
  );

-- Fix restock_logs: restrict SELECT to own logs
DROP POLICY IF EXISTS "Users can view all restock logs" ON public.restock_logs;

CREATE POLICY "Users can view own restock logs" ON public.restock_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Make restock-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'restock-photos';
