-- 1. users 테이블 컬럼 확장
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS manner_score NUMERIC(3,1) DEFAULT 36.5 CHECK (manner_score BETWEEN 0.0 AND 99.9),
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lol_tier TEXT,
  ADD COLUMN IF NOT EXISTS pubg_tier TEXT,
  ADD COLUMN IF NOT EXISTS overwatch_tier TEXT,
  ADD COLUMN IF NOT EXISTS valorant_tier TEXT,
  ADD COLUMN IF NOT EXISTS tft_tier TEXT;

-- 2. 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT null,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT null,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT null,
  score INT CHECK (score BETWEEN 1 AND 5) NOT null,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT null DEFAULT now(),
  UNIQUE(room_id, sender_id, receiver_id)
);

-- 3. 신고 테이블 생성
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET null,
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT null,
  reported_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT null,
  reason TEXT NOT null,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT null DEFAULT now()
);

-- 4. RLS 정책 활성화 및 설정
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 피드백 RLS 정책
CREATE POLICY "Feedbacks are viewable by everyone" ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 신고 RLS 정책
CREATE POLICY "Reports are viewable by admins and reporter" ON public.reports FOR SELECT
  USING (
    auth.uid() = reporter_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Authenticated users can file reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- 5. Realtime 추가
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
