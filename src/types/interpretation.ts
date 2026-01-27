/**
 * LLM 해석 응답 타입 정의
 * 모든 사주 유형별 JSON 구조
 */

// ===== 개인 사주 (Personal) =====
export interface PersonalInterpretation {
  /** 1. 나의 일주 */
  dayPillar: {
    /** 한줄 특징 (15자 내외) */
    characteristic: string
    /** 상세 해석 (300자 내외) */
    description: string
  }

  /** 2. 오행 분석 */
  wuXingAnalysis: {
    /** 전체 균형 분석 */
    balanceAnalysis: string
    /** 강한 오행 특징 */
    strongElement: {
      traits: string
      advantages: string
      cautions: string
      stressRelief: string
    }
    /** 약한 오행 과제 */
    weakElement: {
      challenges: string
      supplements: string
    }
  }

  /** 3. 타고난 성격과 기질 */
  personality: {
    /** 핵심 성격 */
    core: string
    /** 강점 (3-4가지) */
    strengths: string[]
    /** 약점 (2-3가지) */
    weaknesses: string[]
    /** 겉과 속의 차이 */
    innerSelf: string
  }

  /** 4. 대인관계 */
  relationships: {
    /** 인간관계 스타일 */
    style: string
    /** 잘 맞는 유형 */
    compatible: string
    /** 안 맞는 유형 */
    incompatible: string
    /** 관계 조언 */
    advice: string
  }

  /** 5. 적성과 직업 */
  career: {
    /** 어울리는 분야 (3-4개) */
    fields: string[]
    /** 구체적 직업 추천 (5-7개) */
    jobs: string[]
    /** 적성 유형 */
    aptitudeType: string
    /** 일하는 스타일 */
    workStyle: string
    /** 직업 선택 조언 */
    advice: string
  }

  /** 6. 성공운, 재물운 */
  wealth: {
    /** 돈 버는 스타일 */
    earningStyle: string
    /** 맞는 재테크/투자법 */
    investmentStyle: string
    /** 재물운 좋은 시기 */
    peakPeriod: string
    /** 재물운 향상 조언 */
    advice: string
  }

  /** 7. 대운이 들어오는 시기 */
  luckyPeriods: {
    /** 시기 */
    period: string
    /** 기회 설명 */
    opportunity: string
  }[]

  /** 8. 조심해야 할 시기 */
  cautionPeriods: {
    /** 시기 */
    period: string
    /** 주의사항 */
    caution: string
    /** 대처법 */
    solution: string
  }[]

  /** 9. 연애, 결혼운 */
  love: {
    /** 연애 스타일 */
    style: string
    /** 이상형 */
    idealType: string
    /** 결혼 좋은 시기 */
    marriageTiming: string
    /** 연애/결혼 조언 */
    advice: string
  }

  /** 10. 건강운 */
  health: {
    /** 약한 부분 */
    weakPoints: string
    /** 강한 부분 */
    strongPoints: string
    /** 건강 관리 조언 */
    advice: string
  }

  /** 11. MBTI */
  mbti: {
    /** 어울리는 MBTI (2-3개) */
    likely: string[]
    /** 잘 맞는 MBTI (2-3개) */
    compatible: string[]
    /** 안 맞는 MBTI (1-2개) */
    incompatible: string[]
  }
}

// ===== 신년운세 (Yearly) =====
export interface YearlyInterpretation {
  /** 올해의 핵심 요약 */
  summary: {
    /** 올해를 한마디로 */
    oneLine: string
    /** 올해의 키워드 */
    keywords: string[]
  }

  /** 총운 */
  overview: {
    /** 전체적인 흐름 */
    general: string
    /** 상반기 */
    firstHalf: string
    /** 하반기 */
    secondHalf: string
  }

  /** 월별 운세 (1-12월) */
  monthly: {
    /** 월 (1-12) */
    month: number
    /** 운세 점수 (1-5) */
    score: number
    /** 주요 흐름 */
    description: string
  }[]

  /** 행운의 달과 주의할 달 */
  highlights: {
    /** 좋은 달들 */
    luckyMonths: {
      month: number
      reason: string
    }[]
    /** 주의할 달들 */
    cautionMonths: {
      month: number
      caution: string
      solution: string
    }[]
  }

  /** 카테고리별 운세 */
  categories: {
    /** 재물운 */
    wealth: string
    /** 연애운 */
    love: string
    /** 직장운 */
    career: string
    /** 건강운 */
    health: string
  }

  /** 올해의 실천 조언 (2-3가지) */
  actionItems: string[]
}

// ===== 궁합 (Compatibility) =====
export interface CompatibilityInterpretation {
  /** 궁합 점수와 핵심 요약 */
  summary: {
    /** 전체 점수 (100점 만점) */
    score: number
    /** 관계를 한마디로 */
    oneLine: string
    /** 핵심 요약 (2-3문장) */
    description: string
  }

  /** 두 사람의 케미 */
  chemistry: {
    /** 서로 끌리는 포인트 */
    attraction: string
    /** 시너지 */
    synergy: string
  }

  /** 오행 궁합 */
  wuXingMatch: {
    /** 보완/충돌 분석 */
    analysis: string
    /** 조합의 의미 */
    meaning: string
  }

  /** 일간 궁합 */
  dayMasterMatch: {
    /** 관계 분석 */
    relationship: string
    /** 서로에게 미치는 영향 */
    influence: string
  }

  /** 주의할 점 */
  cautions: {
    /** 갈등 상황 */
    conflicts: string
    /** 극복 방법 */
    solutions: string
  }

  /** 올해 관계운 */
  yearlyOutlook: {
    /** 좋아지는 시기 */
    goodPeriod: string
    /** 주의할 시기 */
    cautionPeriod: string
  }

  /** 관계 발전 조언 */
  advice: {
    /** 함께 하면 좋은 활동 */
    activities: string[]
    /** 서로 이해하기 위한 팁 */
    tips: string[]
  }
}

// ===== 연애운 (Love) =====
export interface LoveInterpretation {
  /** 연애 스타일 */
  style: {
    /** 사랑에 빠지는 패턴 */
    pattern: string
    /** 연애할 때의 모습 */
    behavior: string
  }

  /** 잘 맞는 상대 */
  idealPartner: {
    /** 사주적으로 좋은 특성 */
    traits: string
    /** 함께 편한 유형 */
    comfortable: string
  }

  /** 주의할 점 */
  cautions: {
    /** 반복되는 패턴 */
    patterns: string
    /** 의식하면 좋은 부분 */
    awareness: string
  }

  /** 올해 연애운 */
  yearlyOutlook: {
    /** 인연 올 시기 */
    meetingPeriod: string
    /** 관계 발전 포인트 */
    developmentTips: string
    /** 주의할 시기 */
    cautionPeriod: string
  }

  /** 좋은 인연 만나는 팁 */
  meetingTips: {
    /** 장소/상황 */
    places: string[]
    /** 좋은 타이밍 */
    timing: string
  }
}

// ===== 오늘의 운세 (Daily) =====
export interface DailyInterpretation {
  /** 오늘의 총운 */
  overview: string

  /** 행운 키워드 */
  lucky: {
    /** 행운의 색상 */
    color?: string
    /** 행운의 숫자 */
    number?: number
    /** 행운의 방향 */
    direction?: string
  }

  /** 오늘의 조언 */
  advice: string
}

// ===== 통합 타입 =====
export type InterpretationType = 'personal' | 'yearly' | 'compatibility' | 'love' | 'daily'

export type InterpretationResult =
  | { type: 'personal'; data: PersonalInterpretation }
  | { type: 'yearly'; data: YearlyInterpretation }
  | { type: 'compatibility'; data: CompatibilityInterpretation }
  | { type: 'love'; data: LoveInterpretation }
  | { type: 'daily'; data: DailyInterpretation }

// JSON 스키마 예시 (LLM에게 전달용)
export const PERSONAL_JSON_SCHEMA = `{
  "dayPillar": {
    "characteristic": "string (15자 내외 한줄 특징)",
    "description": "string (300자 내외 상세 해석)"
  },
  "wuXingAnalysis": {
    "balanceAnalysis": "string",
    "strongElement": {
      "traits": "string",
      "advantages": "string",
      "cautions": "string",
      "stressRelief": "string"
    },
    "weakElement": {
      "challenges": "string",
      "supplements": "string"
    }
  },
  "personality": {
    "core": "string",
    "strengths": ["string", "string", "string"],
    "weaknesses": ["string", "string"],
    "innerSelf": "string"
  },
  "relationships": {
    "style": "string",
    "compatible": "string",
    "incompatible": "string",
    "advice": "string"
  },
  "career": {
    "fields": ["string", "string", "string"],
    "jobs": ["string", "string", "string", "string", "string"],
    "aptitudeType": "string",
    "workStyle": "string",
    "advice": "string"
  },
  "wealth": {
    "earningStyle": "string",
    "investmentStyle": "string",
    "peakPeriod": "string",
    "advice": "string"
  },
  "luckyPeriods": [
    { "period": "string (예: 20대 중반)", "opportunity": "string" }
  ],
  "cautionPeriods": [
    { "period": "string", "caution": "string", "solution": "string" }
  ],
  "love": {
    "style": "string",
    "idealType": "string",
    "marriageTiming": "string",
    "advice": "string"
  },
  "health": {
    "weakPoints": "string",
    "strongPoints": "string",
    "advice": "string"
  },
  "mbti": {
    "likely": ["ENFP", "INFJ"],
    "compatible": ["ISFJ", "ESFJ"],
    "incompatible": ["ESTJ"]
  }
}`

export const YEARLY_JSON_SCHEMA = `{
  "summary": {
    "oneLine": "string (올해를 한마디로)",
    "keywords": ["string", "string"]
  },
  "overview": {
    "general": "string",
    "firstHalf": "string",
    "secondHalf": "string"
  },
  "monthly": [
    { "month": 1, "score": 1-5, "description": "string" },
    ...
    { "month": 12, "score": 1-5, "description": "string" }
  ],
  "highlights": {
    "luckyMonths": [
      { "month": 3, "reason": "string" }
    ],
    "cautionMonths": [
      { "month": 8, "caution": "string", "solution": "string" }
    ]
  },
  "categories": {
    "wealth": "string",
    "love": "string",
    "career": "string",
    "health": "string"
  },
  "actionItems": ["string", "string"]
}`

export const COMPATIBILITY_JSON_SCHEMA = `{
  "summary": {
    "score": 85,
    "oneLine": "string",
    "description": "string"
  },
  "chemistry": {
    "attraction": "string",
    "synergy": "string"
  },
  "wuXingMatch": {
    "analysis": "string",
    "meaning": "string"
  },
  "dayMasterMatch": {
    "relationship": "string",
    "influence": "string"
  },
  "cautions": {
    "conflicts": "string",
    "solutions": "string"
  },
  "yearlyOutlook": {
    "goodPeriod": "string",
    "cautionPeriod": "string"
  },
  "advice": {
    "activities": ["string", "string"],
    "tips": ["string", "string"]
  }
}`

export const LOVE_JSON_SCHEMA = `{
  "style": {
    "pattern": "string",
    "behavior": "string"
  },
  "idealPartner": {
    "traits": "string",
    "comfortable": "string"
  },
  "cautions": {
    "patterns": "string",
    "awareness": "string"
  },
  "yearlyOutlook": {
    "meetingPeriod": "string",
    "developmentTips": "string",
    "cautionPeriod": "string"
  },
  "meetingTips": {
    "places": ["string", "string"],
    "timing": "string"
  }
}`

export const DAILY_JSON_SCHEMA = `{
  "overview": "string (오늘의 총운)",
  "lucky": {
    "color": "string",
    "number": number,
    "direction": "string"
  },
  "advice": "string (오늘의 조언)"
}`
