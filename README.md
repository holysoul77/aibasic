# 🧠 MindLog: AI 감정 분석 다이어리 & 멘탈 헬스 대시보드

> **Google Gemini 1.5 Flash(무료 AI)**와 **Supabase(PostgreSQL)**를 연동한 스마트 AI 감정 다이어리 및 멘탈 통계 대시보드입니다.

---

## ✨ 핵심 기능

1. **실시간 AI 감정 분석**: 일기를 작성하면 Gemini 1.5 Flash가 **주 감정(행복/평온/피로/불안/슬픔/화남)**, **긍정/행복도(0~100)**, **스트레스 지수(0~100)**, **핵심 키워드**, **AI 심리 코칭 피드백**, **맞춤 힐링 처방**을 자동 생성합니다.
2. **Supabase 클라우드 데이터베이스**: 작성된 일기와 감정 분석 결과를 Supabase의 `diaries` 테이블에 영구 저장합니다. *(API 키 미등록 시 브라우저 LocalStorage 자동 폴백 지원)*
3. **멘탈 헬스 대시보드**: 
   - 평균 긍정 지수, 평균 스트레스, 최근 대표 감정 등 핵심 지표 요약
   - 최근 7회 감정 및 스트레스 추이 비교 차트
   - 감정별 분포 점유율 비율 바
   - 자주 언급된 고민/일상 키워드 클라우드
4. **아카이브 및 필터링**: 감정별 필터링, 실시간 키워드 검색, 일기 상세 보기 및 삭제 기능.

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **AI Model**: Google Gemini 1.5 Flash (`@google/genai`)
- **Database**: Supabase (PostgreSQL, `@supabase/supabase-js`)

---

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 키를 입력하세요:

```env
# Supabase 설정 (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API Key (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key-here
```
> 💡 *키를 입력하지 않아도 로컬스토리지 및 스마트 시뮬레이션 모드로 즉시 모든 기능을 체험할 수 있습니다.*

### 3. Supabase 테이블 생성 (SQL Editor)
Supabase 대시보드의 **SQL Editor**에 아래 쿼리를 실행하세요:

```sql
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
```

### 4. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.
