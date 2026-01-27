import type { SajuResult } from '@/types/saju'
import {
  PERSONAL_JSON_SCHEMA,
  YEARLY_JSON_SCHEMA,
  COMPATIBILITY_JSON_SCHEMA,
  LOVE_JSON_SCHEMA,
  DAILY_JSON_SCHEMA,
} from '@/types/interpretation'

export const SYSTEM_PROMPT = `당신은 "팔자냥"의 전문 사주 해석가입니다.

## 역할
- 사주팔자 계산 결과를 바탕으로 친근하고 이해하기 쉬운 해석을 제공합니다
- 전통 사주 명리학의 지혜를 현대적인 언어로 전달합니다

## 성격
- 친근하고 따뜻한 고양이 캐릭터
- 어려운 내용도 쉽게 풀어서 설명
- 긍정적이지만 현실적

## 규칙
1. 반말 금지, "~해요", "~예요" 체 사용
2. 가부장적/구시대적 표현 절대 금지
3. 구체적인 시기는 "10대 후반", "20대 중반" 등 나이대로 표현 (간지 표현 금지)
4. 좋은 점과 주의할 점 균형있게
5. 무조건적인 긍정도, 불필요한 공포 조장도 금지

## 금지 표현
- "남편복", "시어머니 복", "아들을 낳으면"
- "여자는~", "남자답게~", "결혼 적령기"
- "좋은 일이 생길 거예요" (추상적)
- "큰 액운이 있습니다" (공포 조장)
- "을해년", "기묘월" 등 간지로 시기 표현

## 출력 형식
- 반드시 유효한 JSON 형식으로만 응답
- JSON 외의 텍스트는 절대 포함하지 않음
- 마크다운 코드블록(\`\`\`) 없이 순수 JSON만 출력`

export function buildPersonalSajuPrompt(result: SajuResult, gender: string): string {
  // 오행 분포에서 상위 2개 추출
  const wuXingArray = [
    { name: '목(木)', value: result.wuXing.wood },
    { name: '화(火)', value: result.wuXing.fire },
    { name: '토(土)', value: result.wuXing.earth },
    { name: '금(金)', value: result.wuXing.metal },
    { name: '수(水)', value: result.wuXing.water },
  ].sort((a, b) => b.value - a.value)

  const topTwoWuXing = wuXingArray.slice(0, 2).map(w => w.name).join(', ')
  const weakWuXing = wuXingArray.slice(-2).map(w => w.name).join(', ')

  return `## 사주 정보

성별: ${gender === 'male' ? '남성' : '여성'}
사주: ${result.koreanGanji}
일간: ${result.dayMaster} (${result.dayMasterKorean})
일주: ${result.bazi.day}
띠: ${result.zodiac}
납음: ${result.naYin}

### 사주팔자
- 년주: ${result.bazi.year}
- 월주: ${result.bazi.month}
- 일주: ${result.bazi.day}
- 시주: ${result.bazi.hour || '미상'}

### 오행 분포
- 목(木): ${result.wuXing.wood}%
- 화(火): ${result.wuXing.fire}%
- 토(土): ${result.wuXing.earth}%
- 금(金): ${result.wuXing.metal}%
- 수(水): ${result.wuXing.water}%

강한 오행: ${topTwoWuXing}
약한 오행: ${weakWuXing}

### 십신
- 년간: ${result.shiShen.yearGan}
- 월간: ${result.shiShen.monthGan}
- 시간: ${result.shiShen.hourGan || '미상'}

### 대운 (10년 단위 운세)
${result.daYun.slice(0, 8).map(dy =>
  `- ${dy.startAge}~${dy.endAge}세: ${dy.ganZhi}`
).join('\n')}

---

## 요청

위 사주 정보를 분석하여 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. **모든 문자열은 매우 상세하고 구체적으로 작성하세요** (각 필드 최소 100자 이상)
4. 시기는 "10대 후반", "20대 중반", "30대 초반" 등 나이대로 표현하세요
5. 배열 필드는 지정된 개수만큼 채워주세요
6. **추상적인 표현 대신 구체적인 상황, 예시, 행동을 포함하세요**

## JSON 스키마

${PERSONAL_JSON_SCHEMA}

## 각 필드 상세 가이드

1. **dayPillar**: 일주 ${result.bazi.day} 분석
   - characteristic: 이 일주의 핵심을 15자 내외로 표현 (예: "추진력 넘치는 행동파")
   - description: **400자 이상** 작성. 다음을 포함:
     - 일주의 동물이 상징하는 의미와 특징
     - 이 일주가 가진 고유한 매력과 분위기
     - 사람들이 처음 만났을 때 느끼는 인상
     - 이 사주를 가진 사람의 대표적인 행동 패턴

2. **wuXingAnalysis**: 오행 분석 (강한: ${topTwoWuXing}, 약한: ${weakWuXing})
   - balanceAnalysis: **200자 이상** 작성. 전체 오행 균형 분석
   - strongElement 각 필드 **100자 이상**:
     - traits: 강한 오행이 성격에 미치는 구체적 영향
     - advantages: 일상에서 나타나는 구체적 장점 (예시 포함)
     - cautions: 과할 때 나타나는 구체적 문제 상황
     - stressRelief: 구체적인 스트레스 해소법 추천
   - weakElement 각 필드 **100자 이상**:
     - challenges: 부족한 오행으로 인한 구체적 어려움
     - supplements: 보완하는 구체적 방법 (활동, 장소, 물건 등)

3. **personality**: 일간 ${result.dayMasterKorean} 기반 성격 분석
   - core: **200자 이상** 작성. 핵심 성격과 기질을 구체적 상황 예시와 함께
   - strengths: 4개, 각 **50자 이상**의 구체적 설명
   - weaknesses: 3개, 각 **50자 이상**의 구체적 설명
   - innerSelf: **150자 이상** 작성. 겉과 속의 차이, 숨겨진 내면

4. **relationships**: 대인관계 스타일
   - style: **150자 이상** 작성. 친구, 동료, 가족과의 관계 패턴
   - compatible: **100자 이상** 작성. 구체적인 성격 유형 설명
   - incompatible: **100자 이상** 작성. 갈등이 생기는 유형과 이유
   - advice: **100자 이상** 작성. 관계 개선을 위한 구체적 조언

5. **career**: 적성과 직업
   - fields: 4개 분야
   - jobs: 7개 구체적 직업명
   - aptitudeType: **100자 이상** 작성. 어떤 유형의 일에 적합한지
   - workStyle: **100자 이상** 작성. 업무 스타일과 직장 내 성향
   - advice: **100자 이상** 작성. 커리어 발전을 위한 구체적 조언

6. **wealth**: 재물운과 성공운
   - earningStyle: **100자 이상** 작성. 돈을 버는 방식과 재능
   - investmentStyle: **100자 이상** 작성. 맞는 재테크 방법 구체적으로
   - peakPeriod: 구체적인 나이대
   - advice: **100자 이상** 작성. 재물 관리 조언

7. **luckyPeriods**: 운이 좋은 시기 **4개** (나이대로)
   - opportunity: 각 **80자 이상** 작성. 어떤 기회가 오는지 구체적으로

8. **cautionPeriods**: 조심할 시기 **3개** (나이대로)
   - caution: 각 **80자 이상** 작성. 무엇을 조심해야 하는지
   - solution: 각 **80자 이상** 작성. 구체적인 대처법

9. **love**: 연애, 결혼운
   - style: **150자 이상** 작성. 연애할 때의 모습과 패턴
   - idealType: **100자 이상** 작성. 이상형의 구체적 특징
   - marriageTiming: 구체적인 나이대
   - advice: **100자 이상** 작성. 좋은 인연을 만나기 위한 조언

10. **health**: 건강운
    - weakPoints: **100자 이상** 작성. 약한 장기와 주의할 질환
    - strongPoints: **100자 이상** 작성. 강한 부분과 건강 장점
    - advice: **100자 이상** 작성. 건강 관리 구체적 방법

11. **mbti**:
    - likely: 이 사주에 많은 MBTI 2-3개
    - compatible: 잘 맞는 MBTI 2-3개
    - incompatible: 안 맞는 MBTI 1-2개`
}

export function buildYearlySajuPrompt(result: SajuResult, gender: string): string {
  const currentYear = new Date().getFullYear()

  // 오행 분포에서 상위 2개 추출
  const wuXingArray = [
    { name: '목(木)', value: result.wuXing.wood },
    { name: '화(火)', value: result.wuXing.fire },
    { name: '토(土)', value: result.wuXing.earth },
    { name: '금(金)', value: result.wuXing.metal },
    { name: '수(水)', value: result.wuXing.water },
  ].sort((a, b) => b.value - a.value)

  const topTwoWuXing = wuXingArray.slice(0, 2).map(w => w.name).join(', ')
  const weakWuXing = wuXingArray.slice(-2).map(w => w.name).join(', ')

  return `## 사주 정보

성별: ${gender === 'male' ? '남성' : '여성'}
사주: ${result.koreanGanji}
일간: ${result.dayMaster} (${result.dayMasterKorean})
일주: ${result.bazi.day}
띠: ${result.zodiac}

### 사주팔자
- 년주: ${result.bazi.year}
- 월주: ${result.bazi.month}
- 일주: ${result.bazi.day}
- 시주: ${result.bazi.hour || '미상'}

### 오행 분포
- 목(木): ${result.wuXing.wood}%
- 화(火): ${result.wuXing.fire}%
- 토(土): ${result.wuXing.earth}%
- 금(金): ${result.wuXing.metal}%
- 수(水): ${result.wuXing.water}%

강한 오행: ${topTwoWuXing}
약한 오행: ${weakWuXing}

---

## 요청

${currentYear}년 신년운세를 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. monthly 배열은 반드시 1월부터 12월까지 12개 항목을 포함하세요
4. score는 1-5 사이의 정수입니다
5. **모든 문자열은 상세하고 구체적으로 작성하세요**
6. **추상적인 표현 대신 구체적인 상황, 예시, 행동을 포함하세요**

## JSON 스키마

${YEARLY_JSON_SCHEMA}

## 각 필드 상세 가이드

1. **summary**: 올해의 핵심 요약
   - oneLine: **20자 이상** 올해를 한 문장으로 표현 (단순히 "좋은 해"가 아닌 구체적 특징)
   - keywords: 올해의 키워드 **3개** (구체적이고 의미있는 단어)

2. **overview**: ${currentYear}년 총운
   - general: **200자 이상** 작성. 다음을 포함:
     - ${result.dayMasterKorean} 일간이 ${currentYear}년에 받는 영향
     - 올해 전체적인 에너지 흐름과 기조
     - 이 사주에게 올해가 어떤 의미인지
   - firstHalf: **100자 이상** 작성. 1~6월 구체적 분위기와 주요 이벤트
   - secondHalf: **100자 이상** 작성. 7~12월 구체적 분위기와 주요 이벤트

3. **monthly**: 1월~12월 월별 운세 (총 **12개** 필수)
   - month: 1-12
   - score: 1-5점 (1: 매우 나쁨, 5: 매우 좋음)
   - description: **50자 이상** 해당 월의 주요 흐름과 키포인트 (단순 "좋다/나쁘다"가 아닌 구체적 내용)

4. **highlights**: 행운의 달과 주의할 달
   - luckyMonths: **3개** 좋은 달
     - month: 월
     - reason: **60자 이상** 왜 좋은지 구체적 이유와 활용법
   - cautionMonths: **3개** 주의할 달
     - month: 월
     - caution: **60자 이상** 무엇을 주의해야 하는지 구체적 상황
     - solution: **60자 이상** 어떻게 대처하면 좋은지 실천 가능한 조언

5. **categories**: 카테고리별 운세
   - wealth: **150자 이상** 작성. 다음을 포함:
     - 올해 재물운의 전체적 흐름
     - 돈이 들어오는/나가는 시기
     - 재테크나 투자 관련 조언
     - 주의해야 할 지출 패턴
   - love: **150자 이상** 작성. 다음을 포함:
     - 올해 연애운의 전체적 흐름
     - 좋은 인연이 올 수 있는 시기
     - 관계에서 주의할 점
     - 솔로/커플 각각에게 맞는 조언
   - career: **150자 이상** 작성. 다음을 포함:
     - 올해 직장/사업운의 전체적 흐름
     - 승진, 이직, 프로젝트 관련 시기
     - 대인관계/협업 관련 조언
     - 커리어 발전을 위한 구체적 행동
   - health: **150자 이상** 작성. 다음을 포함:
     - 올해 건강운의 전체적 흐름
     - ${weakWuXing} 부족으로 주의할 신체 부위
     - 계절별 건강 관리 포인트
     - 스트레스 관리 및 운동 추천

6. **actionItems**: 올해 꼭 해야 할 것 **4개**
   - 각 항목 **40자 이상** 작성
   - 추상적 조언이 아닌 구체적이고 실천 가능한 행동
   - 예: "건강관리하기" (X) → "주 3회 이상 30분 걷기 운동으로 부족한 목(木) 기운 보충하기" (O)`
}

export function buildCompatibilitySajuPrompt(
  result1: SajuResult,
  gender1: string,
  name1: string,
  result2: SajuResult,
  gender2: string,
  name2: string
): string {
  const currentYear = new Date().getFullYear()

  return `## 첫 번째 사람 (${name1}) 사주 정보

성별: ${gender1 === 'male' ? '남성' : '여성'}
사주: ${result1.koreanGanji}
일간: ${result1.dayMaster} (${result1.dayMasterKorean})

### 사주팔자
- 년주: ${result1.bazi.year}
- 월주: ${result1.bazi.month}
- 일주: ${result1.bazi.day}
- 시주: ${result1.bazi.hour || '미상'}

### 오행 분포
- 목(木): ${result1.wuXing.wood}%
- 화(火): ${result1.wuXing.fire}%
- 토(土): ${result1.wuXing.earth}%
- 금(金): ${result1.wuXing.metal}%
- 수(水): ${result1.wuXing.water}%

---

## 두 번째 사람 (${name2}) 사주 정보

성별: ${gender2 === 'male' ? '남성' : '여성'}
사주: ${result2.koreanGanji}
일간: ${result2.dayMaster} (${result2.dayMasterKorean})

### 사주팔자
- 년주: ${result2.bazi.year}
- 월주: ${result2.bazi.month}
- 일주: ${result2.bazi.day}
- 시주: ${result2.bazi.hour || '미상'}

### 오행 분포
- 목(木): ${result2.wuXing.wood}%
- 화(火): ${result2.wuXing.fire}%
- 토(土): ${result2.wuXing.earth}%
- 금(金): ${result2.wuXing.metal}%
- 수(水): ${result2.wuXing.water}%

---

## 요청

위 두 사람의 궁합을 분석하여 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. score는 0-100 사이의 정수입니다
4. 모든 문자열 필드는 충분히 상세하게 작성하세요

## JSON 스키마

${COMPATIBILITY_JSON_SCHEMA}

## 각 필드 설명

1. **summary**: 궁합 점수와 핵심 요약
   - score: 0-100점
   - oneLine: 두 사람의 관계를 한마디로
   - description: 핵심 요약 2-3문장

2. **chemistry**: 두 사람의 케미
   - attraction: 서로 끌리는 포인트
   - synergy: 함께 있을 때 시너지

3. **wuXingMatch**: 오행 궁합
   - analysis: 두 사람의 오행이 어떻게 보완/충돌하는지
   - meaning: 이 조합의 의미

4. **dayMasterMatch**: 일간 궁합
   - relationship: ${result1.dayMasterKorean}와 ${result2.dayMasterKorean}의 관계
   - influence: 서로에게 미치는 영향

5. **cautions**: 주의할 점
   - conflicts: 갈등이 생길 수 있는 상황
   - solutions: 극복하는 방법

6. **yearlyOutlook**: ${currentYear}년 두 사람의 관계운
   - goodPeriod: 관계가 좋아지는 시기
   - cautionPeriod: 주의할 시기

7. **advice**: 관계 발전 조언
   - activities: 함께 하면 좋은 활동 2-3개
   - tips: 서로를 이해하기 위한 팁 2-3개`
}

export function buildLoveSajuPrompt(result: SajuResult, gender: string): string {
  const currentYear = new Date().getFullYear()

  return `## 사주 정보

성별: ${gender === 'male' ? '남성' : '여성'}
사주: ${result.koreanGanji}
일간: ${result.dayMaster} (${result.dayMasterKorean})

### 오행 분포
- 목(木): ${result.wuXing.wood}%
- 화(火): ${result.wuXing.fire}%
- 토(土): ${result.wuXing.earth}%
- 금(金): ${result.wuXing.metal}%
- 수(水): ${result.wuXing.water}%

---

## 요청

연애운을 분석하여 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. 모든 문자열 필드는 충분히 상세하게 작성하세요

## JSON 스키마

${LOVE_JSON_SCHEMA}

## 각 필드 설명

1. **style**: 연애 스타일
   - pattern: 사랑에 빠지는 패턴
   - behavior: 연애할 때의 모습

2. **idealPartner**: 잘 맞는 상대
   - traits: 사주적으로 좋은 상대의 특성
   - comfortable: 함께 있을 때 편한 유형

3. **cautions**: 연애에서 주의할 점
   - patterns: 반복되는 연애 패턴
   - awareness: 의식하면 좋은 부분

4. **yearlyOutlook**: ${currentYear}년 연애운
   - meetingPeriod: 인연이 올 수 있는 시기
   - developmentTips: 관계 발전 포인트
   - cautionPeriod: 주의할 시기

5. **meetingTips**: 좋은 인연 만나는 팁
   - places: 구체적인 장소/상황 2-3개
   - timing: 좋은 타이밍`
}

export function buildDailySajuPrompt(result: SajuResult, gender: string): string {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]

  return `## 사주 정보

성별: ${gender === 'male' ? '남성' : '여성'}
일간: ${result.dayMaster} (${result.dayMasterKorean})

### 오행 분포
- 목(木): ${result.wuXing.wood}%
- 화(火): ${result.wuXing.fire}%
- 토(土): ${result.wuXing.earth}%
- 금(金): ${result.wuXing.metal}%
- 수(水): ${result.wuXing.water}%

오늘 날짜: ${month}월 ${day}일 (${weekday}요일)

---

## 요청

오늘의 운세를 아래 JSON 형식으로 **짧고 간결하게** 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. 전체 내용을 간결하게 유지하세요

## JSON 스키마

${DAILY_JSON_SCHEMA}

## 각 필드 설명

1. **overview**: 오늘 하루의 전체적인 분위기 (1문장)

2. **lucky**: 행운 키워드 (1-2개만 선택해서 포함)
   - color: 행운의 색상 (선택)
   - number: 행운의 숫자 (선택)
   - direction: 행운의 방향 (선택)

3. **advice**: 오늘 하면 좋은 일 또는 주의할 점 (1-2문장)`
}
