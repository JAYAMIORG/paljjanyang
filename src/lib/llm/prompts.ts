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

## 언어 규칙 (매우 중요!)
- **모든 출력은 100% 한글로 작성해야 합니다**
- **영어 단어 사용 절대 금지** (JSON 키 제외)
- 영어 표현이 필요한 경우 반드시 한글로 번역하여 사용:
  - "balance" → "균형", "energy" → "기운", "style" → "스타일" 또는 "방식"
  - "tip" → "팁" 또는 "조언", "point" → "포인트" 또는 "핵심"
  - "Good/Bad" → "좋은 점/아쉬운 점", "OK" → "괜찮아요"
- 자연스러운 한국어 문장 구조 사용
- 외래어는 일상에서 흔히 쓰이는 것만 허용 (예: 카페, 데이트, 스타일)

## 금지 표현
- "남편복", "시어머니 복", "아들을 낳으면"
- "여자는~", "남자답게~", "결혼 적령기"
- "좋은 일이 생길 거예요" (추상적)
- "큰 액운이 있습니다" (공포 조장)
- "을해년", "기묘월" 등 간지로 시기 표현
- **영어 단어 섞어쓰기 (예: "Good 한 날", "balance가 중요해요")**

## 출력 형식
- 반드시 유효한 JSON 형식으로만 응답
- JSON 외의 텍스트는 절대 포함하지 않음
- 마크다운 코드블록(\`\`\`) 없이 순수 JSON만 출력
- **JSON 값(value)은 모두 한글로 작성**`

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
7. **모든 텍스트는 자연스러운 한글로만 작성하세요 (영어 단어 사용 금지)**

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
   - compatible: **100자 이상** 작성. 잘 맞는 사람의 성향/특징 (예: "차분하고 경청을 잘하는 사람", "계획적이고 신뢰감을 주는 사람") - MBTI 언급 금지
   - incompatible: **100자 이상** 작성. 갈등이 생기는 사람의 성향/특징과 이유 (예: "즉흥적이고 약속을 잘 안 지키는 사람") - MBTI 언급 금지
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

11. **mbti**: 이 사주와 어울리는 MBTI (사주 특성에 맞게 분석)
    - likely: 이 사주를 가진 사람에게 많을 것 같은 MBTI 3-4개
    - compatible: 이 사주와 잘 맞는 MBTI 3-4개
    - incompatible: 이 사주와 안 맞는 MBTI 2-3개`
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
7. **모든 텍스트는 자연스러운 한글로만 작성하세요 (영어 단어 사용 금지)**

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
6. **각 필드의 최소 글자 수를 반드시 지켜주세요**
7. **모든 텍스트는 자연스러운 한글로만 작성하세요 (영어 단어 사용 금지)**

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
  - 예: "상위 1% 천생연분", "상위 10% 찰떡궁합"
- **good**: 장점 요약 (**100자 이상**)
- **bad**: 단점 요약 (**100자 이상**)

### 2. physical (스킨십 & 본능적 끌림)
- **attractionScore**: 본능적 끌림 지수 (0-100)
- **attractionDescription**: 끌림 표현 (**150자 이상**)
  - 두 사람의 일주 조합이 만들어내는 에너지
  - 첫 만남에서 느끼는 끌림의 종류
- **intimacyStyle**: 낮져밤이 스타일 분석 (**150자 이상**)
  - 평소 모습과 둘만 있을 때의 갭

### 3. emotionalExpression (감정 표현 방식 & 교류 궁합) ⭐ 핵심 섹션
**이게 맞으면 웬만한 문제는 넘기고, 이게 안 맞으면 사소한 일로 무너짐**

- **expressionDiff**: 감정 표현 방식의 차이 (**150자 이상**)
  - 슬플 때/기쁠 때/화날 때 각자 어떻게 표현하는지
  - 표현 빈도와 강도의 차이
  - 예: "${name1}님은 말보다 행동으로 표현하고, ${name2}님은 말로 확인받고 싶어해요. '사랑해'를 듣고 싶은 ${name2}님 vs 말 안 해도 알지? 하는 ${name1}님. 이 갭을 인식하는 게 첫 번째 과제!"
- **empathyStyle**: 공감/위로 스타일 궁합 (**150자 이상**)
  - 상대가 힘들 때 어떻게 위로하는지
  - 위로 방식이 맞는지/충돌하는지
  - 예: "${name1}님은 해결책을 제시하려 하고, ${name2}님은 그냥 들어주길 원해요. 조언보다 공감이 필요한 순간을 ${name1}님이 알아채면 관계가 훨씬 부드러워져요."
- **loveLanguage**: 사랑의 언어 궁합 (**150자 이상**)
  - 말(칭찬)/행동(서비스)/헌신(시간)/선물/스킨십 중 각자 선호하는 것
  - 두 사람의 사랑 언어가 맞는지
  - 예: "${name1}님은 함께하는 시간으로 사랑을 느끼고, ${name2}님은 선물이나 서프라이즈로 느껴요. 서로의 언어를 배우면 사랑이 2배로 전달돼요!"

### 4. powerBalance (주도권 & 힘의 균형) ⭐ 중요 섹션
**힘의 균형이 무너지면 아무리 좋아도 오래 못 감**

- **balanceRatio**: 주도권 비율과 패턴 (**150자 이상**)
  - 현재 주도권 비율 (50:50 / 60:40 / 70:30 등)
  - 일방적인지 균형적인지
  - 예: "현재 ${name1}님 60 : ${name2}님 40 비율. ${name1}님이 관계의 템포를 주도하지만, ${name2}님이 감정적 결정권을 쥐고 있어요. 이 정도면 건강한 밸런스!"
- **decisionMaking**: 결정권 분배 (**150자 이상**)
  - 중요한 결정을 누가 내리는지
  - 한쪽이 희생하는 구조인지
  - 예: "데이트 장소는 ${name2}님, 중요한 결정은 ${name1}님이 맡는 게 좋아요. 다만 ${name1}님이 결정하더라도 ${name2}님 의견을 먼저 물어보는 과정은 꼭 필요해요!"
- **futureShift**: 시간이 지날수록 변화 예측 (**100자 이상**)
  - 시간이 지나면 힘이 어느 쪽으로 쏠리는지
  - 예: "결혼 후에는 ${name2}님 쪽으로 주도권이 넘어갈 가능성 있어요. 이때 ${name1}님이 불만을 쌓지 않도록 미리 대화해두세요."

### 5. emotional (속마음 & 성향 분석)
- **loveBalance**: 애정도 밸런스 (**150자 이상**)
  - 누가 먼저 빠지는지, 누가 더 애정 표현을 많이 하는지
- **communication**: 티키타카 소통 스타일 (**150자 이상**)
  - 대화할 때의 특징과 패턴

### 6. conflict (갈등 & 해결 솔루션)
- **triggers**: 주요 싸움 원인 **3-5개**
- **reconciliation**: 화해 매뉴얼 (**200자 이상**)
- **roles**: 서로에게 되어주는 역할
  - myRole: ${name1}이 ${name2}에게 (**100자 이상**)
  - partnerRole: ${name2}가 ${name1}에게 (**100자 이상**)

### 7. warning (위험 신호 & 주의 구간) ⭐ 현실적 조언
**"이혼수" 같은 공포 조장 NO, 현실적인 위험 관리 포인트 제시**

- **recurringIssues**: 반복될 가능성 높은 문제 패턴 (**150자 이상**)
  - 이 커플이 계속 부딪힐 수 있는 문제
  - 예: "돈 문제로 반복적인 갈등이 예상돼요. ${name1}님의 '나중에 걱정하자'와 ${name2}님의 '미리 준비해야지'가 충돌해요. 매달 가계부 회의를 정해두면 이 문제 80%는 예방 가능!"
- **dangerousPeriods**: 특히 위험한 시기/구간 (**150자 이상**)
  - 감정 폭발이나 거리감이 커지는 시기
  - 외부 스트레스(취업, 이직, 가족 문제)가 관계에 미치는 영향
  - 예: "연애 2-3년차, 권태기가 올 수 있어요. 특히 둘 중 한 명이 직장 스트레스를 받는 시기에 관계가 흔들리기 쉬워요. 이때 서로 탓하지 말고 '외부 문제'임을 인식하세요."
- **externalFactors**: 외부 변수(일, 가족, 돈)의 영향 (**150자 이상**)
  - 일/커리어가 관계에 미치는 영향
  - 양가 부모님과의 관계
  - 금전 문제가 터질 가능성
  - 예: "${name1}님 부모님과의 관계에서 갈등이 생길 수 있어요. ${name2}님이 참는 타입이라 쌓아두다 터질 수 있으니, ${name1}님이 중간에서 방패막이 역할을 확실히 해주세요."

### 8. improvement (궁합 개선 전략) ⭐ 가장 중요한 섹션
**"헤어지세요" ❌ / "무조건 맞아요" ❌ / 구체적인 개선 방안 ⭕**

- **changePoints**: 서로 바꿔야 할 포인트
  - person1: ${name1}이 바꿔야 할 점 (**100자 이상**)
    - 예: "표현을 늘려주세요. '알아서 알겠지'가 아니라 말로 해주세요. 특히 고마움과 미안함은 꼭 말로!"
  - person2: ${name2}가 바꿔야 할 점 (**100자 이상**)
    - 예: "상대 반응에 너무 예민하게 굴지 마세요. ${name1}님이 무뚝뚝해도 마음은 있다는 걸 믿어주세요."
- **roleDivision**: 역할 분담 제안 (**150자 이상**)
  - 일상/결정/감정 관리에서 누가 뭘 맡으면 좋은지
  - 예: "중요 결정은 ${name1}님이, 생활 루틴과 일정 관리는 ${name2}님이 맡으세요. 가계부는 ${name2}님이 쓰고, 큰 지출 결정은 같이 하세요."
- **communicationRules**: 의사소통 규칙 제안 (**150자 이상**)
  - 이 커플만을 위한 소통 규칙
  - 예: "화나면 바로 말하지 말고 1시간 쿨타임 가지기. 주 1회 '불만 토크타임' 정해서 쌓인 거 털어놓기. 카톡보다 전화나 만나서 중요한 얘기하기."
- **keyAdvice**: 이 관계를 살리는 핵심 한마디
  - 기억하기 쉬운 한 문장 조언
  - 예: "이 관계는 '표현 규칙'만 만들면 오래 갑니다"

### 9. future (결혼 & 미래 가능성)
- **marriageProspect**: 결혼 전망 (**150자 이상**)
- **synergy**: 재물운/자녀운 시너지 (**150자 이상**)`
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
6. **모든 텍스트는 자연스러운 한글로만 작성하세요 (영어 단어 사용 금지)**

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
6. **모든 텍스트는 자연스러운 한글로만 작성하세요 (영어 단어 사용 금지)**

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
