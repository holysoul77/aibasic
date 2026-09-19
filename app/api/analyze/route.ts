import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { DiaryAnalysisResult, EmotionType } from '@/types/diary';

// 시뮬레이션 폴백 분석 (API 키가 없거나 할당량 초과 시에도 시연 가능)
function generateFallbackAnalysis(content: string): DiaryAnalysisResult {
  const text = content.toLowerCase();

  let emotion: EmotionType = 'calm';
  let score = 70;
  let stress = 30;
  let energy = 65;
  const keywords: string[] = ['일상', '기록', '생각'];

  if (text.includes('행복') || text.includes('좋았') || text.includes('신나') || text.includes('성공') || text.includes('재미') || text.includes('설레')) {
    emotion = 'happy';
    score = 90;
    stress = 20;
    energy = 85;
    keywords.push('성취', '즐거움', '행복');
  } else if (text.includes('불안') || text.includes('걱정') || text.includes('떨려') || text.includes('무서')) {
    emotion = 'anxious';
    score = 40;
    stress = 75;
    energy = 50;
    keywords.push('고민', '불안', '도전');
  } else if (text.includes('피곤') || text.includes('힘들') || text.includes('지쳐') || text.includes('야자') || text.includes('시험')) {
    emotion = 'tired';
    score = 45;
    stress = 65;
    energy = 35;
    keywords.push('휴식필요', '피로', '열심');
  } else if (text.includes('슬프') || text.includes('우울') || text.includes('눈물') || text.includes('속상')) {
    emotion = 'sad';
    score = 30;
    stress = 60;
    energy = 30;
    keywords.push('위로', '마음정리');
  } else if (text.includes('화나') || text.includes('짜증') || text.includes('답답') || text.includes('억울')) {
    emotion = 'angry';
    score = 35;
    stress = 85;
    energy = 70;
    keywords.push('스트레스', '감정조절');
  }

  const feedbackMap: Record<EmotionType, string> = {
    happy: '오늘 하루 긍정적인 에너지가 가득했네요! 소중한 성취의 순간을 온전히 만끽하세요.',
    calm: '차분하고 잔잔한 하루를 보내셨군요. 마음에 여유를 가지는 것만으로도 큰 힘이 됩니다.',
    tired: '오늘 하루도 정말 치열하게 달리셨네요. 많이 지쳤을 텐데, 오늘만큼은 자신을 칭찬해주세요.',
    anxious: '미래에 대한 걱정은 그만큼 잘 해내고 싶다는 뜻이에요. 한 걸음씩 나아가면 충분합니다.',
    sad: '마음이 많이 무거우셨군요. 슬픔을 억누르지 말고 솔직하게 안아주는 시간이 필요해요.',
    angry: '답답하고 화나는 감정은 자연스러운 신호입니다. 심호흡과 함께 감정을 천천히 흘려보내요.',
  };

  const actionMap: Record<EmotionType, string> = {
    happy: '스스로에게 소소한 보상(맛있는 간식이나 좋아하는 영상 시청)을 선물해보세요.',
    calm: '좋아하는 차 한 잔과 함께 가벼운 독서나 명상으로 하루를 마무리해보세요.',
    tired: '스마트폰을 내려놓고 오늘은 평소보다 30분 일찍 따뜻하게 잠자리에 들어보세요.',
    anxious: '지금 당장 바꿀 수 없는 걱정은 종이에 적어 구겨 버리고, 4-7-8 호흡법을 해보세요.',
    sad: '포근한 담요를 덮고 편안한 음악을 들으며 마음을 따뜻하게 안아주세요.',
    angry: '빠른 템포의 음악을 들으며 가볍게 걷거나 찬물 세안으로 열감을 식혀보세요.',
  };

  return {
    primary_emotion: emotion,
    emotion_score: score,
    stress_level: stress,
    energy_level: energy,
    keywords: Array.from(new Set(keywords)).slice(0, 4),
    ai_feedback: feedbackMap[emotion],
    prescribed_action: actionMap[emotion],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '일기 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // API Key가 없으면 스마트 폴백으로 처리
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      const fallback = generateFallbackAnalysis(content);
      return NextResponse.json({
        ...fallback,
        is_simulated: true,
      });
    }

    // Google Gemini 1.5 Flash 연동
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
당신은 다정하고 통찰력 있는 전문 심리 상담 AI 코치입니다.
사용자가 작성한 아래의 일기 제목과 본문을 깊이 있게 읽고, 심리 감정 상태를 분석하여 반드시 유효한 JSON 형식으로만 응답하세요.

[일기 제목]: ${title || '무제'}
[일기 본문]:
${content}

반드시 아래 JSON 스키마 규격을 정확히 지켜야 합니다:
{
  "primary_emotion": "happy" | "calm" | "tired" | "anxious" | "sad" | "angry",
  "emotion_score": number (0부터 100 사이, 전반적 긍정/행복도 지수),
  "stress_level": number (0부터 100 사이, 스트레스 지수),
  "energy_level": number (0부터 100 사이, 신체적/정신적 활력도),
  "keywords": string[] (일기 핵심을 요약하는 3~4개의 명사 단어, '#' 기호 없이),
  "ai_feedback": string (사용자의 마음에 깊이 공감하고 따뜻한 격려와 통찰을 건네는 존댓말 2~3문장),
  "prescribed_action": string (멘탈 회복이나 하루 정리를 위해 구체적으로 실천할 수 있는 1~2가지 소소한 힐링 팁)
}
마크다운 코드블록(\`\`\`json) 없이 순수 JSON 문자열만 출력하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const responseText = response.text?.trim() || '';
    
    // JSON 파싱 (코드블록 포맷팅 제거 안전장치)
    const cleaned = responseText
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed: DiaryAnalysisResult = JSON.parse(cleaned);

    return NextResponse.json({
      ...parsed,
      is_simulated: false,
    });
  } catch (error) {
    console.error('AI Analysis failed, using fallback:', error);
    // 에러 발생 시에도 중단되지 않고 폴백 제공
    return NextResponse.json({
      ...generateFallbackAnalysis(''),
      is_simulated: true,
      error_note: 'Gemini API 호출 오류로 시뮬레이션 모드로 전환되었습니다.',
    });
  }
}

