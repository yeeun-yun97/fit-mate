-- Fit Mate: Supabase DB Schema
-- Supabase SQL Editor에서 실행하세요.

-- 1. daily_logs (매일 아침 기록)
CREATE TABLE public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  fasting_glucose NUMERIC(5,1),
  fasting_ketone NUMERIC(4,2),
  diet_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, log_date)
);
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);

-- 2. inbody_logs (주간 인바디)
CREATE TABLE public.inbody_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  measured_date DATE NOT NULL,
  basal_metabolic_rate NUMERIC(6,1),
  skeletal_muscle_mass NUMERIC(5,2),
  body_fat_mass NUMERIC(5,2),
  bmi NUMERIC(4,1),
  body_fat_pct NUMERIC(4,1),
  abdominal_fat_ratio NUMERIC(4,2),
  visceral_fat_level NUMERIC(4,1),
  body_water NUMERIC(5,2),
  protein NUMERIC(5,2),
  minerals NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, measured_date)
);
CREATE INDEX idx_inbody_logs_user_date ON public.inbody_logs(user_id, measured_date DESC);

-- 3. period_logs (생리 기간)
CREATE TABLE public.period_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_period_logs_user_date ON public.period_logs(user_id, start_date DESC);

-- 4. bowel_logs (배변 기록)
CREATE TABLE public.bowel_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  log_time TIME,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_bowel_logs_user_date ON public.bowel_logs(user_id, log_date DESC);

-- 5. RLS 정책
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbody_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bowel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily_logs" ON public.daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_logs" ON public.daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_logs" ON public.daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_logs" ON public.daily_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own inbody_logs" ON public.inbody_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inbody_logs" ON public.inbody_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbody_logs" ON public.inbody_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inbody_logs" ON public.inbody_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own period_logs" ON public.period_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own period_logs" ON public.period_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own period_logs" ON public.period_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own period_logs" ON public.period_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bowel_logs" ON public.bowel_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bowel_logs" ON public.bowel_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bowel_logs" ON public.bowel_logs FOR DELETE USING (auth.uid() = user_id);

-- 6. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.inbody_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.period_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
