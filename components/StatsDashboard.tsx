'use client';

import React from 'react';
import { DiaryEntry, EMOTION_MAP, EmotionType } from '@/types/diary';
import { Smile, TrendingUp, Zap, Activity, Heart, Tag } from 'lucide-react';

interface StatsDashboardProps {
  diaries: DiaryEntry[];
}

export default function StatsDashboard({ diaries }: StatsDashboardProps) {
  if (diaries.length === 0) {
    return null;
  }

  // 통계 계산
  const totalCount = diaries.length;
  const avgScore = Math.round(
    diaries.reduce((acc, cur) => acc + cur.emotion_score, 0) / totalCount
  );
  const avgStress = Math.round(
    diaries.reduce((acc, cur) => acc + cur.stress_level, 0) / totalCount
  );
  const avgEnergy = Math.round(
    diaries.reduce((acc, cur) => acc + cur.energy_level, 0) / totalCount
  );

  // 감정별 빈도수 계산
  const emotionCounts: Record<EmotionType, number> = {
    happy: 0,
    calm: 0,
    tired: 0,
    anxious: 0,
    sad: 0,
    angry: 0,
  };
  diaries.forEach((d) => {
    if (emotionCounts[d.primary_emotion] !== undefined) {
      emotionCounts[d.primary_emotion]++;
    }
  });

  // 가장 빈도 높은 감정
  let dominantEmotion: EmotionType = 'calm';
  let maxCount = -1;
  (Object.keys(emotionCounts) as EmotionType[]).forEach((key) => {
    if (emotionCounts[key] > maxCount) {
      maxCount = emotionCounts[key];
      dominantEmotion = key;
    }
  });

  // 최근 7개 일기 (차트용, 오래된 순서대로 정렬)
  const recentForChart = [...diaries]
    .slice(0, 7)
    .reverse();

  // 모든 키워드 수집 및 상위 6개 추출
  const keywordMap: Record<string, number> = {};
  diaries.forEach((d) => {
    (d.keywords || []).forEach((kw) => {
      keywordMap[kw] = (keywordMap[kw] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([kw]) => kw);

  return (
    <section className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 평균 긍정/행복도 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              평균 긍정 지수
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {avgScore}
            </span>
            <span className="text-xs text-zinc-400">/ 100점</span>
          </div>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        {/* Card 2: 평균 스트레스 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-purple-300 dark:hover:border-purple-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              평균 스트레스
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {avgStress}
            </span>
            <span className="text-xs text-zinc-400">/ 100점</span>
          </div>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgStress}%` }}
            />
          </div>
        </div>

        {/* Card 3: 대표 감정 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              최근 주 감정
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-2xl">{EMOTION_MAP[dominantEmotion].emoji}</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {EMOTION_MAP[dominantEmotion].label}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            총 {emotionCounts[dominantEmotion]}회 기록됨
          </p>
        </div>

        {/* Card 4: 활력/에너지 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-amber-300 dark:hover:border-amber-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              평균 활력도
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {avgEnergy}
            </span>
            <span className="text-xs text-zinc-400">/ 100점</span>
          </div>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgEnergy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                최근 7회 감정 & 스트레스 추이
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">긍정 지수</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-zinc-500">스트레스</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {recentForChart.map((d) => {
              const dateStr = d.date.slice(5); // MM-DD
              return (
                <div
                  key={d.id}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10">
                    {d.title} (긍정 {d.emotion_score} / 스트레스 {d.stress_level})
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    {/* Emotion Score Bar */}
                    <div
                      className="w-1/2 max-w-[14px] bg-emerald-400 dark:bg-emerald-500 hover:bg-emerald-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(d.emotion_score, 8)}%` }}
                    />
                    {/* Stress Level Bar */}
                    <div
                      className="w-1/2 max-w-[14px] bg-purple-400 dark:bg-purple-500 hover:bg-purple-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(d.stress_level, 8)}%` }}
                    />
                  </div>

                  {/* Date & Emoji */}
                  <div className="mt-2 text-center">
                    <span className="text-xs block">{EMOTION_MAP[d.primary_emotion].emoji}</span>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      {dateStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotion Distribution & Keywords */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">
              감정 분포 비율
            </h3>
            <div className="space-y-2">
              {(Object.keys(emotionCounts) as EmotionType[]).map((key) => {
                const count = emotionCounts[key];
                const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                const info = EMOTION_MAP[key];
                if (count === 0) return null;

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center space-x-1 text-zinc-600 dark:text-zinc-300">
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                      </span>
                      <span className="font-semibold text-zinc-500">
                        {count}회 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: info.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Keywords */}
          {topKeywords.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center space-x-1 text-xs text-zinc-500 mb-2">
                <Tag className="w-3 h-3" />
                <span className="font-medium">자주 언급된 키워드</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

