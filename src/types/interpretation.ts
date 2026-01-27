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

  /** 대인관계 */
  relationships: {
    /** 올해 대인관계에서 주의할 점 */
    caution: string
    /** 올해 나의 귀인 유형 */
    helper: {
      /** 귀인의 특징/유형 */
      type: string
      /** 어디서 만날 수 있는지 */
      where: string
    }
  }

  /** 올해의 실천 조언 (2-3가지) */
  actionItems: string[]
}

// ===== 궁합 (Compatibility) =====
export interface CompatibilityInterpretation {
  /** 총 요약 섹션 */
  summary: {
    /** 관계를 한마디로 정의 (예: "톰과 제리", "환상의 짝꿍") */
    relationshipTag: string
    /** 부제 설명 (예: "티격태격", "상호보완") */
    tagDescription: string
    /** 종합 점수 (0-100) */
    score: number
    /** 랭킹 표현 (예: "상위 1% 천생연분") */
    ranking: string
    /** 장점 요약 (100자 이상) */
    good: string
    /** 단점 요약 (100자 이상) */
    bad: string
  }

  /** 스킨십 & 본능적 끌림 */
  physical: {
    /** 본능적 끌림 지수 (0-100) */
    attractionScore: number
    /** 끌림 표현 (150자 이상) */
    attractionDescription: string
    /** 낮져밤이 스타일 (150자 이상) */
    intimacyStyle: string
  }

  /** 감정 표현 방식 & 교류 궁합 */
  emotionalExpression: {
    /** 감정 표현 방식의 차이 (150자 이상) */
    expressionDiff: string
    /** 공감/위로 스타일 궁합 (150자 이상) */
    empathyStyle: string
    /** 사랑의 언어 (말/행동/헌신) 궁합 (150자 이상) */
    loveLanguage: string
  }

  /** 주도권 & 힘의 균형 */
  powerBalance: {
    /** 주도권 비율과 패턴 (150자 이상) */
    balanceRatio: string
    /** 결정권 분배 (150자 이상) */
    decisionMaking: string
    /** 시간이 지날수록 변화 예측 (100자 이상) */
    futureShift: string
  }

  /** 속마음 & 성향 분석 */
  emotional: {
    /** 애정도 밸런스 - 누가 더 사랑하는지 (150자 이상) */
    loveBalance: string
    /** 티키타카 - 소통 스타일 (150자 이상) */
    communication: string
  }

  /** 갈등 & 해결 솔루션 */
  conflict: {
    /** 주요 싸움 원인들 (3-5개) */
    triggers: string[]
    /** 화해 매뉴얼 (200자 이상) */
    reconciliation: string
    /** 서로에게 되어주는 역할 */
    roles: {
      /** 첫번째가 두번째에게 (100자 이상) */
      myRole: string
      /** 두번째가 첫번째에게 (100자 이상) */
      partnerRole: string
    }
  }

  /** 위험 신호 & 주의 구간 */
  warning: {
    /** 반복될 가능성 높은 문제 패턴 (150자 이상) */
    recurringIssues: string
    /** 특히 위험한 시기/구간 (150자 이상) */
    dangerousPeriods: string
    /** 외부 변수(일, 가족, 돈)의 영향 (150자 이상) */
    externalFactors: string
  }

  /** 궁합 개선 전략 */
  improvement: {
    /** 서로 바꿔야 할 포인트 */
    changePoints: {
      /** 첫번째가 바꿔야 할 점 (100자 이상) */
      person1: string
      /** 두번째가 바꿔야 할 점 (100자 이상) */
      person2: string
    }
    /** 역할 분담 제안 (150자 이상) */
    roleDivision: string
    /** 의사소통 규칙 제안 (150자 이상) */
    communicationRules: string
    /** 이 관계를 살리는 핵심 한마디 */
    keyAdvice: string
  }

  /** 결혼 & 미래 가능성 */
  future: {
    /** 결혼 전망 (150자 이상) */
    marriageProspect: string
    /** 재물운/자녀운 시너지 (150자 이상) */
    synergy: string
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
  /** 3초 요약 (The Hook) */
  hook: {
    /** 한 줄 코멘트 - 확실한 지침 */
    oneLiner: string
    /** 오늘의 총점 (0-100) */
    score: number
    /** 핵심 키워드 해시태그 (3-4개) */
    hashtags: string[]
  }

  /** 액션 & 개운 아이템 */
  luckyItems: {
    /** 행운의 컬러 & 코디 */
    color: {
      name: string
      tip: string
    }
    /** 행운의 푸드 */
    food: {
      name: string
      reason: string
    }
    /** 행운의 방향 */
    direction: {
      name: string
      tip: string
    }
    /** 행운의 숫자 */
    number: number
  }

  /** 재미 & 경고 */
  people: {
    /** 오늘의 빌런 - 조심할 사람 */
    villain: string
    /** 오늘의 귀인 - 도움될 사람 */
    helper: string
  }
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
  "relationships": {
    "caution": "string (대인관계 주의점)",
    "helper": {
      "type": "string (귀인 유형)",
      "where": "string (만날 장소)"
    }
  },
  "actionItems": ["string", "string"]
}`

export const COMPATIBILITY_JSON_SCHEMA = `{
  "summary": {
    "relationshipTag": "string (관계 정의, 예: 톰과 제리)",
    "tagDescription": "string (부제, 예: 티격태격)",
    "score": 0-100,
    "ranking": "string (예: 상위 1% 천생연분)",
    "good": "string (장점 요약 100자 이상)",
    "bad": "string (단점 요약 100자 이상)"
  },
  "physical": {
    "attractionScore": 0-100,
    "attractionDescription": "string (본능적 끌림 150자 이상)",
    "intimacyStyle": "string (낮져밤이 스타일 150자 이상)"
  },
  "emotionalExpression": {
    "expressionDiff": "string (감정 표현 방식의 차이 150자 이상)",
    "empathyStyle": "string (공감/위로 스타일 궁합 150자 이상)",
    "loveLanguage": "string (사랑의 언어 궁합 150자 이상)"
  },
  "powerBalance": {
    "balanceRatio": "string (주도권 비율과 패턴 150자 이상)",
    "decisionMaking": "string (결정권 분배 150자 이상)",
    "futureShift": "string (시간 지날수록 변화 예측 100자 이상)"
  },
  "emotional": {
    "loveBalance": "string (누가 더 사랑하는지 150자 이상)",
    "communication": "string (티키타카 스타일 150자 이상)"
  },
  "conflict": {
    "triggers": ["string", "string", "string", "string", "string"],
    "reconciliation": "string (화해 매뉴얼 200자 이상)",
    "roles": {
      "myRole": "string (첫번째가 두번째에게 되어주는 역할 100자 이상)",
      "partnerRole": "string (두번째가 첫번째에게 되어주는 역할 100자 이상)"
    }
  },
  "warning": {
    "recurringIssues": "string (반복될 가능성 높은 문제 패턴 150자 이상)",
    "dangerousPeriods": "string (특히 위험한 시기/구간 150자 이상)",
    "externalFactors": "string (외부 변수의 영향 150자 이상)"
  },
  "improvement": {
    "changePoints": {
      "person1": "string (첫번째가 바꿔야 할 점 100자 이상)",
      "person2": "string (두번째가 바꿔야 할 점 100자 이상)"
    },
    "roleDivision": "string (역할 분담 제안 150자 이상)",
    "communicationRules": "string (의사소통 규칙 제안 150자 이상)",
    "keyAdvice": "string (이 관계를 살리는 핵심 한마디)"
  },
  "future": {
    "marriageProspect": "string (결혼 전망 150자 이상)",
    "synergy": "string (재물운/자녀운 시너지 150자 이상)"
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
  "hook": {
    "oneLiner": "string (한 줄 코멘트)",
    "score": number (0-100),
    "hashtags": ["#키워드1", "#키워드2", "#키워드3"]
  },
  "luckyItems": {
    "color": {
      "name": "string (색상명)",
      "tip": "string (코디 팁)"
    },
    "food": {
      "name": "string (음식명)",
      "reason": "string (추천 이유)"
    },
    "direction": {
      "name": "string (방향)",
      "tip": "string (활용 팁)"
    },
    "number": number (1-99)
  },
  "people": {
    "villain": "string (조심할 사람 특징)",
    "helper": "string (도움될 사람 특징)"
  }
}`
