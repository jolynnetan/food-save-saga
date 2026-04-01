
-- User Recipes table
CREATE TABLE public.user_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '👨‍🍳',
  cuisine TEXT NOT NULL DEFAULT 'any',
  diet TEXT[] NOT NULL DEFAULT '{none}',
  time TEXT NOT NULL DEFAULT '30 min',
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  fat INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipes" ON public.user_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON public.user_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON public.user_recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON public.user_recipes FOR DELETE USING (auth.uid() = user_id);

-- Calorie Entries table
CREATE TABLE public.calorie_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  calories INTEGER NOT NULL DEFAULT 0,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0,
  meal_time TEXT NOT NULL DEFAULT '',
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.calorie_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own calorie entries" ON public.calorie_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calorie entries" ON public.calorie_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own calorie entries" ON public.calorie_entries FOR DELETE USING (auth.uid() = user_id);

-- Scan Results table
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories INTEGER NOT NULL DEFAULT 0,
  leftovers_count INTEGER NOT NULL DEFAULT 0,
  fresh_count INTEGER NOT NULL DEFAULT 0,
  waste_reduction_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipe_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scan results" ON public.scan_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scan results" ON public.scan_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scan results" ON public.scan_results FOR DELETE USING (auth.uid() = user_id);

-- Pantry Items table
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📦',
  quantity TEXT NOT NULL DEFAULT '',
  expiry_date DATE NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pantry items" ON public.pantry_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pantry items" ON public.pantry_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pantry items" ON public.pantry_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pantry items" ON public.pantry_items FOR DELETE USING (auth.uid() = user_id);

-- Food Tracker Entries table
CREATE TABLE public.food_tracker_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  amount TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'consumed',
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.food_tracker_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own food tracker entries" ON public.food_tracker_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food tracker entries" ON public.food_tracker_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own food tracker entries" ON public.food_tracker_entries FOR DELETE USING (auth.uid() = user_id);

-- User Activities table
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'meal',
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  detail TEXT NOT NULL DEFAULT '',
  calories INTEGER,
  can_repeat BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON public.user_activities FOR DELETE USING (auth.uid() = user_id);
