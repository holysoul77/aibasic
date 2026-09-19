'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import StatsDashboard from '@/components/StatsDashboard';
import DiaryForm from '@/components/DiaryForm';
import DiaryList from '@/components/DiaryList';
import SupabaseGuideModal from '@/components/SupabaseGuideModal';
import { DiaryEntry } from '@/types/diary';
import { getDiaries, isSupabaseConfigured } from '@/lib/supabase';
import { Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getDiaries();
        setDiaries(list);
      } catch (err) {
        console.error('Failed to load diaries:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDiaryCreated = (entry: DiaryEntry) => {
    setDiaries((prev) => [entry, ...prev]);
  };

  const handleDiaryDeleted = (id: string) => {
    setDiaries((prev) => prev.filter((item) => item.id !== id));
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onScrollToForm={scrollToForm}
        isSupabaseActive={isSupabaseConfigured}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-zinc-900 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Next.js 16 + Google Gemini AI + Supabase</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              당신의 하루와 마음에 귀 기울이는 <br />
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                스마트 AI 감정 다이어리
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              짧은 일기를 남기면 Gemini 1.5 Flash가 행복도, 스트레스, 숨은 감정을 정밀 분석하여
              구조화된 DB로 축적하고, 당신만을 위한 따뜻한 조언과 통계를 제공합니다.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-zinc-300">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>데이터베이스 자동 백업</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-pink-400" />
                <span>실시간 심리 코칭 피드백</span>
              </div>
            </div>
          </div>

          {/* Decorative Background Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Dashboard Analytics Section */}
        {isLoading ? (
          <div className="h-48 flex items-center justify-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2 text-zinc-400 text-sm">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>감정 데이터 통계 불러오는 중...</span>
            </div>
          </div>
        ) : (
          <StatsDashboard diaries={diaries} />
        )}

        {/* Diary Writing Section */}
        <div ref={formRef}>
          <DiaryForm onDiaryCreated={handleDiaryCreated} />
        </div>

        {/* Diary List Section */}
        <DiaryList diaries={diaries} onDiaryDeleted={handleDiaryDeleted} />
      </main>

      {/* Supabase Setup Modal */}
      <SupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isSupabaseActive={isSupabaseConfigured}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800 py-8 bg-white/50 dark:bg-zinc-900/50 text-xs text-zinc-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MindLog. AI 감정 분석 다이어리 & 멘탈 대시보드</p>
          <div className="flex items-center space-x-3">
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">
              Next.js 16
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">
              Supabase
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">
              Gemini 1.5 Flash
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
