'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink } from 'lucide-react';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseActive: boolean;
}

const SUPABASE_SQL = `-- Supabase SQL Editor에 복사하여 실행하세요.
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON public.diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_date ON public.diaries(date DESC);

-- 공개 데모용 RLS 정책 활성화
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read and insert" ON public.diaries FOR ALL USING (true) WITH CHECK (true);
`;

export default function SupabaseGuideModal({
  isOpen,
  onClose,
  isSupabaseActive,
}: SupabaseGuideModalProps) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const envText = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Supabase DB & AI 연동 안내
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                현재 상태:{' '}
                <span
                  className={
                    isSupabaseActive
                      ? 'text-emerald-600 font-medium'
                      : 'text-amber-500 font-medium'
                  }
                >
                  {isSupabaseActive
                    ? '✅ Supabase 클라우드 DB 정상 연결됨'
                    : '⚡ 브라우저 로컬스토리지 모드로 동작 중 (즉시 사용 가능)'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
          {/* Step 1: SQL Setup */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Supabase 테이블 생성 (SQL Editor)</span>
              </h3>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>Supabase 콘솔 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-500">
              Supabase 프로젝트의 <strong>SQL Editor</strong>에서 아래 쿼리를 붙여넣고 [Run]을 누르세요.
            </p>
            <div className="relative">
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded-xl text-xs font-mono overflow-x-auto max-h-40 border border-zinc-800">
                {SUPABASE_SQL}
              </pre>
              <button
                onClick={handleCopySql}
                className="absolute top-2 right-2 flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? '복사됨!' : 'SQL 복사'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: .env.local Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>.env.local 환경 변수 등록</span>
              </h3>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>무료 Gemini 키 발급</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-500">
              프로젝트 루트에 <code>.env.local</code> 파일을 생성하고 발급받은 키를 채워넣으세요.
            </p>
            <div className="relative">
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded-xl text-xs font-mono overflow-x-auto border border-zinc-800">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here`}
              </pre>
              <button
                onClick={handleCopyEnv}
                className="absolute top-2 right-2 flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? '복사됨!' : '템플릿 복사'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-300">
            💡 <strong>안내:</strong> 아직 Supabase 또는 Gemini 키가 없으시더라도, 모든 일기 작성과 AI 분석, 대시보드 통계 기능이 브라우저 로컬 저장소와 스마트 시뮬레이터를 통해 100% 정상 작동합니다.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
