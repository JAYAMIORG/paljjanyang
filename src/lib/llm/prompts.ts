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

6. **relationships**: 올해 대인관계
   - caution: **100자 이상** 작성. 다음을 포함:
     - 올해 대인관계에서 특히 주의할 점
     - 갈등이 생길 수 있는 상황과 유형
     - 관계를 망칠 수 있는 나의 행동 패턴
     - 조심해야 할 시기
   - helper (귀인):
     - type: **80자 이상** 작성. 다음을 포함:
       - 올해 나를 도와줄 귀인의 특징 (성별, 나이대, 성격, 직업 등)
       - 어떤 도움을 줄 수 있는지
       - 예: "나보다 5-10살 많은 여성 선배, 차분하고 꼼꼼한 성격, 실질적인 조언을 해줄 귀인"
     - where: **60자 이상** 작성. 다음을 포함:
       - 귀인을 만날 수 있는 구체적인 장소나 상황
       - 예: "직장 내 다른 부서, 동창 모임, 종교 활동에서 만날 가능성이 높아요"

7. **actionItems**: 올해 꼭 해야 할 것 **4개**
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
  return `## 첫 번째 사람 (${name1}) 사주 정보

성별: ${gender1 === 'male' ? '남성' : '여성'}
사주: ${result1.koreanGanji}
일간: ${result1.dayMaster} (${result1.dayMasterKorean})
일주: ${result1.bazi.day}

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
일주: ${result2.bazi.day}

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

MZ세대를 위한 재미있고 솔직한 궁합 분석을 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. **재미있고 공유하고 싶은 표현**을 사용하세요
4. **솔직하지만 저속하지 않게** 표현하세요
5. 일지(배우자 궁)의 합충, 천간의 합충을 고려하여 분석하세요

## JSON 스키마

${COMPATIBILITY_JSON_SCHEMA}

## 각 필드 상세 가이드

### 1. summary (총 요약 섹션)

- **relationshipTag**: 두 사람 관계를 재미있게 정의하는 별명
  - 예: "톰과 제리", "환상의 짝꿍", "불타는 로맨스", "전우애", "밀당 고수들"
- **tagDescription**: 별명의 부제 설명
  - 예: "티격태격", "상호보완", "열정 과다", "동지적 관계"
- **score**: 0-100점 종합 궁합 점수
- **ranking**: 점수를 재미있게 표현
  - 예: "상위 1% 천생연분", "상위 10% 찰떡궁합", "노력이 필요한 40점", "운명적 만남 85점"
- **good**: 장점 한 줄 요약 (**40자 이상**)
  - 예: "서로의 부족한 오행을 채워주는 완벽한 보완 관계"
- **bad**: 단점 한 줄 요약 (**40자 이상**)
  - 예: "의사소통 방식이 완전 반대라 오해가 생기기 쉬움"

### 2. physical (스킨십 & 본능적 끌림)
**유료 결제 포인트! 솔직하지만 저속하지 않게**

- **attractionScore**: 본능적 끌림 지수 (0-100)
  - 일지(배우자 궁)의 육합, 삼합 여부로 판단
- **attractionDescription**: 끌림을 재미있게 표현 (**60자 이상**)
  - 좋은 예: "만나자마자 스파크 튀는 사이", "친구처럼 편안한 스킨십", "노력이 필요한 온도 차이"
- **intimacyStyle**: 낮져밤이 스타일 분석 (**80자 이상**)
  - ${result1.dayMasterKorean}와 ${result2.dayMasterKorean}의 에너지 레벨 비교
  - 예: "낮에는 ${name2}님이 리드, 밤에는 ${name1}님이 주도권을 잡는 게 좋아요"

### 3. conflict (갈등 & 해결 솔루션)
**실용적인 조언 제공**

- **triggers**: 주요 싸움 원인 **3개** (형, 충, 원진살 작용 고려)
  - 예: "돈 문제로 예민함", "이성 친구 문제(질투)", "자존심 싸움", "말투 때문에 빈정 상함", "계획 vs 즉흥"
- **reconciliation**: 화해 매뉴얼 (**100자 이상**)
  - 상대 성향에 맞는 구체적 화해법
  - 예: "이 상대는 논리적으로 따지면 안 됩니다. 무조건 감정적으로 공감해 주세요"
  - 예: "감정 호소보다는 팩트로 설득해야 풀립니다. 시간을 두고 차분히 대화하세요"
- **roles**: 서로에게 되어주는 역할
  - myRole: ${name1}이 ${name2}에게 되어주는 역할 (**40자 이상**)
    - 예: "당신은 상대의 '브레이크' 역할입니다. 과한 열정을 적당히 식혀주세요"
  - partnerRole: ${name2}가 ${name1}에게 되어주는 역할 (**40자 이상**)
    - 예: "상대는 당신의 '엑셀' 역할입니다. 소심할 때 용기를 불어넣어 줄 거예요"

### 4. future (결혼 & 미래 가능성)

- **marriageProspect**: 결혼 성사 확률/전망 (**80자 이상**)
  - 배우자 자리 글자 확인, 대운 흐름 고려
  - 예: "연애만 하는 게 좋을 수도? 결혼하면 서로 간섭이 많아질 수 있어요"
  - 예: "결혼하면 더 대박 나는 커플! 함께할수록 시너지가 커집니다"
- **synergy**: 자녀운/재물운 시너지 (**80자 이상**)
  - 예: "둘이 합치면 재물운이 2배! 공동 투자나 사업 추천"
  - 예: "자식 교육관 충돌 주의. 미리 대화로 기준을 정해두세요"

### 5. emotional (속마음 & 성향 분석)

- **loveBalance**: 애정도 밸런스 (**80자 이상**)
  - 일간의 생(生)/극(剋) 관계 분석
  - 예: "${name1}님이 더 많이 퍼주는 사랑. 가끔은 받기만 해도 괜찮아요"
  - 예: "${name2}님이 더 집착하는 관계. 적당한 밀당이 필요합니다"
  - 예: "대등한 밀당 고수들! 서로 적당한 거리감을 유지하는 게 오래 가는 비결"
- **communication**: 티키타카 소통 스타일 (**80자 이상**)
  - 천간(생각/이상)의 합/충 관계 분석
  - 예: "개그 코드가 잘 맞음! 같이 있으면 웃음이 끊이지 않아요"
  - 예: "말만 하면 오해 발생. 중요한 얘기는 문자보다 직접 만나서 하세요"
  - 예: "눈빛만 봐도 아는 사이. 말 없이도 통하는 텔레파시 커플"`
}

export function buildLoveSajuPrompt(result: SajuResult, gender: string): string {
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

### 십신
- 년간: ${result.shiShen.yearGan}
- 월간: ${result.shiShen.monthGan}
- 시간: ${result.shiShen.hourGan || '미상'}

---

## 요청

연애운을 분석하여 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. **모든 문자열은 상세하고 구체적으로 작성하세요**
4. **각 필드는 서로 다른 관점의 내용을 담아주세요 (중복 금지)**
5. **"일간의 연애운" 같은 일반론이 아닌, 이 사람만의 구체적 특징을 작성하세요**

## JSON 스키마

${LOVE_JSON_SCHEMA}

## 각 필드 상세 가이드

**주의: 각 필드는 서로 다른 내용을 담아야 합니다. 같은 말을 반복하지 마세요.**

1. **style**: 연애 스타일 (서로 다른 관점!)
   - pattern: **150자 이상** 작성. 다음을 포함:
     - 어떤 상황에서 호감을 느끼는지
     - 첫눈에 반하는 타입인지, 천천히 정이 드는 타입인지
     - 마음을 주기까지의 과정과 특징
     - 구체적인 상황 예시 포함
   - behavior: **150자 이상** 작성. 다음을 포함 (pattern과 중복 금지!):
     - 연인에게 애정 표현하는 방식
     - 데이트할 때의 모습과 선호하는 스타일
     - 갈등 상황에서의 대처 방식
     - 장거리/단거리 연애 성향

2. **idealPartner**: 잘 맞는 상대 (서로 다른 관점!)
   - traits: **150자 이상** 작성. 다음을 포함:
     - ${weakWuXing}을 보완해줄 수 있는 상대의 오행적 특성
     - 그런 상대의 구체적인 성격과 행동 패턴
     - 왜 이런 상대와 잘 맞는지 사주적 근거
   - comfortable: **150자 이상** 작성 (traits와 중복 금지!):
     - 일상에서 편하게 느끼는 상대 유형
     - 대화 스타일, 생활 패턴 관점에서의 궁합
     - 함께 있을 때 편안함을 느끼는 구체적 상황

3. **cautions**: 연애에서 주의할 점 (서로 다른 관점!)
   - patterns: **150자 이상** 작성. 다음을 포함:
     - ${topTwoWuXing}이 강해서 나타나는 연애 패턴
     - 과거에 반복했을 수 있는 실수나 문제
     - 이 패턴이 관계에 미치는 구체적 영향
   - awareness: **150자 이상** 작성 (patterns와 중복 금지!):
     - 연애할 때 의식적으로 노력할 부분
     - 상대방 입장에서 느낄 수 있는 불편함
     - 관계를 오래 유지하기 위한 구체적 조언

4. **yearlyOutlook**: ${currentYear}년 연애운 (각 필드 다른 내용!)
   - meetingPeriod: **100자 이상** 작성. 다음을 포함:
     - 새로운 인연이 올 수 있는 구체적 시기 (월 단위)
     - 어떤 상황/장소에서 만날 가능성이 높은지
     - 이 시기에 적극적으로 해야 할 행동
   - developmentTips: **100자 이상** 작성 (meetingPeriod와 중복 금지!):
     - 이미 만난 인연과 관계를 발전시키는 방법
     - 커플이라면 관계 깊어지는 시기와 방법
     - 고백이나 프로포즈 적합한 타이밍
   - cautionPeriod: **100자 이상** 작성:
     - 연애에서 주의해야 할 시기 (월 단위)
     - 무엇을 조심해야 하는지 구체적으로
     - 이 시기를 잘 넘기기 위한 조언

5. **meetingTips**: 좋은 인연 만나는 팁
   - places: **4개** 구체적인 장소/상황
     - 단순히 "카페", "헬스장"이 아닌 구체적 상황 포함
     - 예: "주말 오전 브런치 카페에서 책 읽을 때", "동호회나 취미 클래스에서"
   - timing: **100자 이상** 작성. 다음을 포함:
     - 연애하기 좋은 계절이나 시기
     - 마음의 준비가 되는 시점
     - 적극적으로 움직여야 할 때`
}

export function buildDailySajuPrompt(result: SajuResult, gender: string): string {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]

  // 오행 분포에서 상위/하위 추출
  const wuXingArray = [
    { name: '목(木)', element: 'wood', value: result.wuXing.wood },
    { name: '화(火)', element: 'fire', value: result.wuXing.fire },
    { name: '토(土)', element: 'earth', value: result.wuXing.earth },
    { name: '금(金)', element: 'metal', value: result.wuXing.metal },
    { name: '수(水)', element: 'water', value: result.wuXing.water },
  ].sort((a, b) => b.value - a.value)

  const strongElement = wuXingArray[0].name
  const weakElement = wuXingArray[wuXingArray.length - 1].name

  return `## 사주 정보

성별: ${gender === 'male' ? '남성' : '여성'}
일간: ${result.dayMaster} (${result.dayMasterKorean})
일주: ${result.bazi.day}
띠: ${result.zodiac}

### 오행 분포
- 목(木): ${result.wuXing.wood}%
- 화(火): ${result.wuXing.fire}%
- 토(土): ${result.wuXing.earth}%
- 금(金): ${result.wuXing.metal}%
- 수(水): ${result.wuXing.water}%

강한 오행: ${strongElement}
약한 오행: ${weakElement}

오늘 날짜: ${month}월 ${day}일 (${weekday}요일)

---

## 요청

MZ세대를 위한 재미있고 실용적인 오늘의 운세를 아래 JSON 형식으로 응답해주세요.

**중요 규칙:**
1. 반드시 유효한 JSON 형식으로만 응답하세요
2. JSON 외의 텍스트는 절대 포함하지 마세요
3. ${result.dayMasterKorean} 일간과 오늘의 기운을 고려하여 작성하세요
4. **명언 같은 모호한 말보다 확실하고 구체적인 지침**을 제공하세요
5. 재미있고 공유하고 싶은 내용으로 작성하세요

## JSON 스키마

${DAILY_JSON_SCHEMA}

## 각 필드 상세 가이드

### 1. hook (3초 요약) - 앱 켜자마자 보는 오늘의 결론

- **oneLiner**: 확실한 한 줄 지침 (모호한 명언 금지!)
  - 좋은 예: "오늘은 입조심이 생명입니다", "뜻밖의 꽁돈이 들어오는 날!", "가만히 있어도 중간은 갑니다"
  - 나쁜 예: "좋은 일이 생길 것입니다", "마음을 열면 행운이 옵니다"

- **score**: 0-100점 (오늘의 총점)
  - ${result.dayMasterKorean} 일간과 오늘 일진의 합충 관계 고려
  - 합(合): +점수, 충(沖): -점수, 천을귀인: 대폭+

- **hashtags**: 3-4개의 핵심 키워드 (반드시 # 포함)
  - 예: ["#말조심", "#충동구매금지", "#소개팅대박", "#야근각"]

### 2. luckyItems (액션 & 개운 아이템) - "그래서 오늘 뭐 해야 해?"

- **color**: ${weakElement} 기운을 보충하는 색상
  - name: 색상명 (예: "네이비", "코랄핑크")
  - tip: 코디 팁 (**30자 이상**, 구체적으로!)
    - 예: "오늘의 행운 컬러는 네이비. 청바지나 네이비 니트를 입어보세요!"

- **food**: 부족한 기운을 채워주는 음식 추천
  - name: 구체적인 음식명 (예: "마라탕", "삼겹살", "냉면")
  - reason: 추천 이유 (**30자 이상**)
    - 예: "화(火) 기운이 필요해요. 매콤한 음식으로 활력을 충전하세요!"

- **direction**: 행운의 방향
  - name: 동/서/남/북/동북/동남/서북/서남 중 하나
  - tip: 활용 팁 (**30자 이상**)
    - 예: "집 기준 동쪽에 귀인이 있어요. 동쪽으로 점심 먹으러 가보세요!"

- **number**: 행운의 숫자 (1-99)

### 3. people (재미 & 경고) - SNS 공유 욕구 자극!

- **villain**: 오늘 나를 힘들게 할 사람 특징 (**구체적이고 재미있게!**)
  - 좋은 예: "오늘 '김씨' 성을 가진 사람을 조심하세요", "안경 쓴 남자가 스트레스를 줍니다", "목소리 큰 상사가 잔소리할 수 있어요"

- **helper**: 오늘 나를 도와줄 귀인 특징 (**구체적이고 재미있게!**)
  - 좋은 예: "쥐띠 동료가 커피를 사줄지도 몰라요", "머리 긴 여자가 좋은 정보를 줍니다", "후배가 의외의 도움을 줄 수 있어요"`
}
