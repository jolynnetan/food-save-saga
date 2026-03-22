
-- Create donation points table (NGO foodbank locations)
CREATE TABLE public.donation_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  ngo_name text NOT NULL,
  contact_info text,
  operating_hours text,
  current_stock_level text DEFAULT 'medium',
  emoji text DEFAULT '🏪',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_points ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view donation points
CREATE POLICY "Anyone can view donation points"
ON public.donation_points FOR SELECT TO authenticated
USING (true);

-- Create restock logs table
CREATE TABLE public.restock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donation_point_id uuid NOT NULL REFERENCES public.donation_points(id) ON DELETE CASCADE,
  photo_url text,
  notes text,
  items_donated text,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restock_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own restock logs"
ON public.restock_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all restock logs"
ON public.restock_logs FOR SELECT TO authenticated
USING (true);

-- Create food collections table
CREATE TABLE public.food_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donation_point_id uuid NOT NULL REFERENCES public.donation_points(id) ON DELETE CASCADE,
  items_collected text,
  collected_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own collections"
ON public.food_collections FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own collections"
ON public.food_collections FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Storage bucket for restock photos
INSERT INTO storage.buckets (id, name, public) VALUES ('restock-photos', 'restock-photos', true);

CREATE POLICY "Authenticated users can upload restock photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'restock-photos');

CREATE POLICY "Anyone can view restock photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'restock-photos');

-- Seed some mock donation points
INSERT INTO public.donation_points (name, description, address, lat, lng, ngo_name, contact_info, operating_hours, current_stock_level, emoji) VALUES
('KL Food Aid Center', 'Main distribution hub for KL area', '12 Jalan Masjid India, KL', 3.152, 101.698, 'Food Aid Foundation', '03-2222-1234', 'Mon-Sat 9am-5pm', 'low', '🏢'),
('Bangsar Community Pantry', 'Community-run open pantry', '45 Jalan Telawi, Bangsar', 3.131, 101.671, 'Kechara Soup Kitchen', '03-3333-5678', 'Daily 8am-8pm', 'medium', '🏪'),
('Cheras Hope Kitchen', 'Serves hot meals and dry goods', '88 Jalan Cheras, Cheras', 3.108, 101.733, 'The Lost Food Project', '03-4444-9012', 'Mon-Fri 10am-4pm', '高', '🍲'),
('Petaling Jaya Food Bank', 'Dry goods and essentials', '23 Jalan SS2, PJ', 3.117, 101.627, 'Rise Against Hunger MY', '03-5555-3456', 'Tue-Sun 9am-6pm', 'high', '📦'),
('Sentul Relief Point', 'Emergency food supplies', '7 Jalan Sentul, Sentul', 3.182, 101.691, 'Food Aid Foundation', '03-6666-7890', 'Daily 7am-7pm', 'medium', '🆘');

-- Trigger for updated_at
CREATE TRIGGER update_donation_points_updated_at
  BEFORE UPDATE ON public.donation_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
