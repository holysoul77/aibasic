'use client';

import React, { useState } from 'react';
import { DiaryEntry, EMOTION_MAP, EmotionType } from '@/types/diary';
import { BookOpen, Search, Trash2, Calendar, Sparkles, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteDiary } from '@/lib/supabase';

interface DiaryListProps {
  diaries: DiaryEntry[];
  onDiaryDeleted: (id: string) => void;
}

export default function DiaryList({ diaries, onDiaryDeleted }: DiaryListProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 필터링 로직
  const filteredDiaries = diaries.filter((d) => {
    // 감정 필터
    if (selectedFilter !== 'all' && d.primary_emotion !== selectedFilter) {
      return false;
    }
    // 검색어 필터 (제목, 본문, 키워드)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = d.title.toLowerCase().includes(q);
      const inContent = d.content.toLowerCase().includes(q);
      const inKeywords = (d.keywords || []).some((kw) => kw.toLowerCase().includes(q));
      return inTitle || inContent || inKeywords;
    }
    return true;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      await deleteDiary(id);
      onDiaryDeleted(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-4">
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            기록된 감정 아카이브
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
            {filteredDiaries.length}편
          </span>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="제목, 내용, 태그 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Emotion Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedFilter === 'all'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          전체 보기
        </button>
        {(Object.keys(EMOTION_MAP) as EmotionType[]).map((key) => {
          const info = EMOTION_MAP[key];
          const isSelected = selectedFilter === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? `${info.bgColor} ${info.textColor} ${info.borderColor} shadow-sm ring-1 ring-current`
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Diary Cards Grid */}
      {filteredDiaries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <span className="text-4xl block">📝</span>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            조건에 맞는 일기가 없습니다.
          </p>
          <p className="text-xs text-zinc-400">
            위의 &apos;오늘의 일기 쓰기&apos;를 통해 하루의 감정을 기록해보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDiaries.map((entry) => {
            const emotion = EMOTION_MAP[entry.primary_emotion] || EMOTION_MAP.calm;
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                onClick={() => toggleExpand(entry.id)}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Emotion Badge & Date & Delete */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${emotion.bgColor} ${emotion.textColor} ${emotion.borderColor}`}
                    >
                      <span>{emotion.emoji}</span>
                      <span>{emotion.label}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{entry.date}</span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(entry.id, e)}
                        className="p-1 hover:text-red-500 rounded transition-colors"
                        title="일기 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview Content */}
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-1">
                    {entry.title}
                  </h3>
                  <p
                    className={`mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ${
                      isExpanded ? '' : 'line-clamp-2'
                    }`}
                  >
                    {entry.content}
                  </p>
                </div>

                {/* Score Indicators */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center space-x-1">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                      <span>긍정 {entry.emotion_score}점</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>스트레스 {entry.stress_level}점</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>활력 {entry.energy_level}점</span>
                    </span>
                  </div>

                  {/* Keywords */}
                  {entry.keywords && entry.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* AI Feedback Box (Expanded or Preview) */}
                  <div className="mt-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-900/40 text-xs space-y-1.5">
                    <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI 심리 피드백</span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {entry.ai_feedback}
                    </p>

                    {isExpanded && entry.prescribed_action && (
                      <div className="pt-2 mt-2 border-t border-indigo-100/60 dark:border-indigo-900/40">
                        <span className="font-semibold text-purple-600 dark:text-purple-400 block mb-0.5">
                          🌿 힐링 케어 제안:
                        </span>
                        <p className="text-zinc-700 dark:text-zinc-300">
                          {entry.prescribed_action}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expand / Collapse Indicator */}
                  <div className="flex justify-center pt-1 text-zinc-400 text-xs">
                    {isExpanded ? (
                      <span className="flex items-center space-x-0.5">
                        <span>접기</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="flex items-center space-x-0.5">
                        <span>자세히 보기</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

