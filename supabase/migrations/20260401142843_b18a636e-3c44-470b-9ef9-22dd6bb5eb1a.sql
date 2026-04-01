
CREATE TABLE public.food_drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  description TEXT NOT NULL DEFAULT '',
  posted_by_name TEXT NOT NULL DEFAULT 'Anonymous',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  claimed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.food_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view food drops"
ON public.food_drops FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert own food drops"
ON public.food_drops FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update food drops to claim"
ON public.food_drops FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Users can delete own food drops"
ON public.food_drops FOR DELETE TO authenticated
USING (auth.uid() = user_id);
