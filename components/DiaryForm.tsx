'use client';

import React, { useState } from 'react';
import { DiaryEntry, EMOTION_MAP } from '@/types/diary';
import { Sparkles, Calendar, PenLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveDiary } from '@/lib/supabase';

interface DiaryFormProps {
  onDiaryCreated: (entry: DiaryEntry) => void;
}

const INSPIRATION_CHIPS = [
  '오늘 가장 뿌듯했던 일',
  '공부하다 지치고 막막했던 순간',
  '친구와 즐겁게 웃었던 대화',
  '홀로 조용히 산책하며 느낀 생각',
];

export default function DiaryForm({ onDiaryCreated }: DiaryFormProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [lastCreated, setLastCreated] = useState<DiaryEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('일기 내용을 입력해주세요.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setStatusStep('🤖 Gemini 1.5 Flash가 일기를 정밀 분석 중...');

    try {
      // 1. AI 감정 분석 호출
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || '오늘의 기록',
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('AI 감정 분석에 실패했습니다.');
      }

      const analysis = await res.json();

      setStatusStep('💾 Supabase DB에 감정 데이터 저장 중...');

      // 2. 다이어리 객체 생성
      const newEntry: DiaryEntry = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `d-${Date.now()}`,
        date: date || todayStr,
        title: title.trim() || '오늘의 기록',
        content: content.trim(),
        primary_emotion: analysis.primary_emotion,
        emotion_score: analysis.emotion_score,
        stress_level: analysis.stress_level,
        energy_level: analysis.energy_level,
        keywords: analysis.keywords || [],
        ai_feedback: analysis.ai_feedback,
        prescribed_action: analysis.prescribed_action,
        created_at: new Date().toISOString(),
      };

      // 3. Supabase 및 로컬 저장
      await saveDiary(newEntry);

      // 4. 완료 처리
      onDiaryCreated(newEntry);
      setLastCreated(newEntry);
      setTitle('');
      setContent('');
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : '일기 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
      setStatusStep('');
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <PenLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              오늘의 감정 일기 작성
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              오늘 하루 느꼈던 솔직한 생각을 적어보세요. AI 코치가 감정을 읽고 맞춤 조언을 건넵니다.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Inspiration Quick Chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
        <span className="font-medium mr-1">💡 작성 힌트:</span>
        {INSPIRATION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setContent((prev) => (prev ? `${prev}\n${chip}: ` : `${chip}: `))}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="제목을 입력하세요 (예: 뿌듯했던 해커톤 준비)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            rows={4}
            placeholder="오늘 하루 어떤 일들이 있었나요? 기뻤던 일, 지쳤던 순간, 속상했던 일 무엇이든 편하게 털어놓아 보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-zinc-400">
            {isLoading ? (
              <span className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{statusStep}</span>
              </span>
            ) : (
              <span>✨ Gemini 1.5 Flash & Supabase 연동</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>분석 및 저장 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI 감정 분석 & 저장</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Analysis Result Banner after Submit */}
      {lastCreated && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/20 border border-indigo-100 dark:border-indigo-900/60 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                방금 작성한 일기 분석 완료!
              </span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <span>{EMOTION_MAP[lastCreated.primary_emotion].emoji}</span>
              <span className="text-zinc-800 dark:text-zinc-200">
                {EMOTION_MAP[lastCreated.primary_emotion].label}
              </span>
              <span className="text-emerald-600 font-bold ml-1">
                {lastCreated.emotion_score}점
              </span>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                💬 AI 코치의 따뜻한 한마디:
              </span>
              <p>{lastCreated.ai_feedback}</p>
            </div>
            <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-purple-100/60 dark:border-purple-900/40">
              <span className="font-semibold text-purple-600 dark:text-purple-400 block mb-1">
                🌿 추천 힐링 액션:
              </span>
              <p>{lastCreated.prescribed_action}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
