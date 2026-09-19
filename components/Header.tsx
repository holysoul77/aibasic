'use client';

import React from 'react';
import { Sparkles, Database, PlusCircle, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onScrollToForm: () => void;
  isSupabaseActive: boolean;
}

export default function Header({
  onOpenGuide,
  onScrollToForm,
  isSupabaseActive,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                MindLog
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                AI 멘탈 코치
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              AI 감정 분석 다이어리 & 멘탈 헬스 대시보드
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Supabase Status Badge */}
          <button
            onClick={onOpenGuide}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              isSupabaseActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
            title="Supabase DB 연동 상태 및 설정 가이드"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">
              {isSupabaseActive ? 'Supabase 연동됨' : '로컬 모드 (DB설정)'}
            </span>
            <HelpCircle className="w-3 h-3 text-zinc-400" />
          </button>

          {/* New Diary Button */}
          <button
            onClick={onScrollToForm}
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>오늘의 일기 쓰기</span>
          </button>
        </div>
      </div>
    </header>
  );
}

