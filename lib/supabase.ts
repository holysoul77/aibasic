import { createClient } from '@supabase/supabase-js';
import { DiaryEntry } from '@/types/diary';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const LOCAL_STORAGE_KEY = 'mindlog_diaries_v1';

// 초기 시연용 샘플 데이터 (처음 접속 시에도 대시보드가 풍성하게 보이도록 지원)
const INITIAL_DEMO_DIARIES: DiaryEntry[] = [
  {
    id: 'demo-1',
    date: '2026-09-18',
    title: '해커톤 아이디어 회의 완료!',
    content: '팀원들과 함께 밤늦게까지 서비스 아이디어를 기획했다. 처음엔 막막했는데 AI와 Supabase를 엮는 멋진 아이디어가 나와서 너무 설레고 기대된다.',
    primary_emotion: 'happy',
    emotion_score: 88,
    stress_level: 25,
    energy_level: 80,
    keywords: ['해커톤', '아이디어', '팀프로젝트', '설렘'],
    ai_feedback: '새로운 도전에 대한 열정과 팀원들과의 시너지가 돋보이는 하루였네요! 설레는 시작을 응원합니다.',
    prescribed_action: '내일 개발을 위해 오늘 밤은 푹 자고 컨디션을 조절해보세요.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    date: '2026-09-17',
    title: '모의고사 수학 오답 정리',
    content: '수학 4점짜리 문제들이 생각보다 어려워서 당황했다. 그래도 틀린 문제들을 하나씩 분석하며 내 약점을 찾을 수 있었다.',
    primary_emotion: 'tired',
    emotion_score: 52,
    stress_level: 65,
    energy_level: 45,
    keywords: ['수학', '모의고사', '오답정리', '노력'],
    ai_feedback: '어려운 문제 앞에서도 포기하지 않고 약점을 짚어낸 태도가 정말 멋져요. 지금 흘린 땀방울이 곧 실력이 됩니다.',
    prescribed_action: '머리를 식힐 겸 가벼운 스트레칭과 따뜻한 물 한 잔을 마셔보세요.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-3',
    date: '2026-09-16',
    title: '가을 하늘 보며 산책',
    content: '공부하다가 바람 쐬러 운동장을 걸었다. 구름도 예쁘고 바람도 시원해서 마음이 한결 가벼워졌다.',
    primary_emotion: 'calm',
    emotion_score: 75,
    stress_level: 20,
    energy_level: 60,
    keywords: ['산책', '가을하늘', '휴식', '평온'],
    ai_feedback: '잠시 멈춰 서서 자연을 바라보는 여유가 마음을 충전해주었네요. 평온한 에너지를 잘 간직하세요.',
    prescribed_action: '좋아하는 잔잔한 인디 음악을 들으며 하루를 편안히 마무리해보세요.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// 다이어리 목록 불러오기
export async function getDiaries(): Promise<DiaryEntry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as DiaryEntry[];
      }
      console.warn('Supabase fetch error, fallback to localStorage:', error);
    } catch (err) {
      console.warn('Supabase request failed, fallback to localStorage:', err);
    }
  }

  // LocalStorage Fallback (브라우저 환경)
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DIARIES));
      return INITIAL_DEMO_DIARIES;
    }
    try {
      return JSON.parse(cached);
    } catch {
      return INITIAL_DEMO_DIARIES;
    }
  }

  return INITIAL_DEMO_DIARIES;
}

// 다이어리 저장
export async function saveDiary(entry: DiaryEntry): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('diaries').insert([
        {
          id: entry.id,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          primary_emotion: entry.primary_emotion,
          emotion_score: entry.emotion_score,
          stress_level: entry.stress_level,
          energy_level: entry.energy_level,
          keywords: entry.keywords,
          ai_feedback: entry.ai_feedback,
          prescribed_action: entry.prescribed_action,
          created_at: entry.created_at,
        },
      ]);

      if (error) {
        console.error('Supabase insert failed:', error);
        // Supabase 에러 시에도 localStorage에 저장하여 사용자 데이터 보존
        saveToLocalStorage(entry);
        return { success: false, error: error.message };
      }
      saveToLocalStorage(entry);
      return { success: true };
    } catch (err) {
      console.error('Supabase save error:', err);
      saveToLocalStorage(entry);
      return { success: false, error: String(err) };
    }
  }

  saveToLocalStorage(entry);
  return { success: true };
}

// 다이어리 삭제
export async function deleteDiary(id: string): Promise<{ success: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('diaries').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const list = await getDiaries();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
  return { success: true };
}

function saveToLocalStorage(entry: DiaryEntry) {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: DiaryEntry[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    const filtered = list.filter((item) => item.id !== entry.id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([entry, ...filtered]));
  }
}

