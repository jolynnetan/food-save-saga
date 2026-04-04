
-- Friend codes table
CREATE TABLE public.friend_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.friend_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend code"
  ON public.friend_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own friend code"
  ON public.friend_codes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to look up a user_id by friend code (security definer so anyone can resolve codes)
CREATE OR REPLACE FUNCTION public.lookup_friend_code(lookup_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.friend_codes WHERE code = lookup_code LIMIT 1;
$$;

-- Friendships table (accepted connections)
CREATE TABLE public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendships"
  ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their friendships"
  ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend requests table
CREATE TABLE public.friend_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friend requests"
  ON public.friend_requests FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send friend requests"
  ON public.friend_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update requests sent to them"
  ON public.friend_requests FOR UPDATE TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

CREATE POLICY "Users can delete their own sent requests"
  ON public.friend_requests FOR DELETE TO authenticated
  USING (auth.uid() = from_user_id);

-- Friend messages table
CREATE TABLE public.friend_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '👋',
  type text NOT NULL DEFAULT 'message',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.friend_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON public.friend_messages FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages"
  ON public.friend_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete their own messages"
  ON public.friend_messages FOR DELETE TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Function to accept a friend request (creates bidirectional friendship)
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from uuid;
  v_to uuid;
BEGIN
  SELECT from_user_id, to_user_id INTO v_from, v_to
  FROM friend_requests
  WHERE id = request_id AND to_user_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or already handled';
  END IF;

  UPDATE friend_requests SET status = 'accepted', updated_at = now() WHERE id = request_id;

  INSERT INTO friendships (user_id, friend_id) VALUES (v_from, v_to) ON CONFLICT DO NOTHING;
  INSERT INTO friendships (user_id, friend_id) VALUES (v_to, v_from) ON CONFLICT DO NOTHING;
END;
$$;

-- Function to generate a random 8-char alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT upper(substr(md5(gen_random_uuid()::text), 1, 8));
$$;
