
DROP POLICY "Users can update food drops to claim" ON public.food_drops;

CREATE POLICY "Users can claim available food drops"
ON public.food_drops FOR UPDATE TO authenticated
USING (status = 'available');
