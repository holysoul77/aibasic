CREATE TABLE IF NOT EXISTS public.diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  primary_emotion VARCHAR(50) NOT NULL,
  emotion_score INTEGER NOT NULL CHECK (emotion_score BETWEEN 0 AND 100),
  stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 0 AND 100),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 0 AND 100),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  ai_feedback TEXT NOT NULL,
  prescribed_action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON public.diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_date ON public.diaries(date DESC);

ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read and insert" ON public.diaries FOR ALL USING (true) WITH CHECK (true);

