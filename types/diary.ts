export type EmotionType = 'happy' | 'calm' | 'tired' | 'anxious' | 'sad' | 'angry';

export interface EmotionInfo {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const EMOTION_MAP: Record<EmotionType, EmotionInfo> = {
  happy: {
    label: '기쁨/행복',
    emoji: '😊',
    color: '#10B981', // emerald-500
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  calm: {
    label: '차분/평온',
    emoji: '🌿',
    color: '#06B6D4', // cyan-500
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  tired: {
    label: '지침/피로',
    emoji: '🥱',
    color: '#F59E0B', // amber-500
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  anxious: {
    label: '불안/걱정',
    emoji: '😰',
    color: '#8B5CF6', // purple-500
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  sad: {
    label: '슬픔/우울',
    emoji: '😢',
    color: '#3B82F6', // blue-500
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  angry: {
    label: '화남/답답',
    emoji: '🔥',
    color: '#EF4444', // red-500
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};

export interface DiaryAnalysisResult {
  primary_emotion: EmotionType;
  emotion_score: number; // 0 ~ 100 (행복/긍정도)
  stress_level: number;  // 0 ~ 100 (스트레스 수치)
  energy_level: number;  // 0 ~ 100 (활력/에너지)
  keywords: string[];    // 주요 키워드 해시태그
  ai_feedback: string;   // 따뜻한 공감 피드백
  prescribed_action: string; // 멘탈 회복/케어 추천 행동
}

export interface DiaryEntry extends DiaryAnalysisResult {
  id: string;
  date: string;          // YYYY-MM-DD
  title: string;
  content: string;
  created_at: string;
}

