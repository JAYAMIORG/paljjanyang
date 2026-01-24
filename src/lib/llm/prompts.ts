import type { SajuResult } from '@/types/saju'

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
3. 구체적인 날짜, 시기, 행동 제안 포함
4. 좋은 점과 주의할 점 균형있게
5. 무조건적인 긍정도, 불필요한 공포 조장도 금지

## 금지 표현
- "남편복", "시어머니 복", "아들을 낳으면"
- "여자는~", "남자답게~", "결혼 적령기"
- "좋은 일이 생길 거예요" (추상적)
- "큰 액운이 있습니다" (공포 조장)

## 출력 형식
- 마크다운 형식으로 작성
- 섹션별로 명확하게 구분
- 핵심 요약은 2-3문장으로 간결하게`

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

위 사주 정보를 바탕으로 다음 11개 항목을 분석해주세요.
**중요: 각 섹션은 최소 500자(공백 포함) 이상으로 충분히 상세하게 작성해주세요.**
**을해년, 기묘월 등 간지 표현은 사용하지 말고, "10대 후반", "20대 중반", "30대 초반" 등 나이대로 표현해주세요.**

---

### 1. 나의 일주 동물 (${result.bazi.day})

- **한줄 요약**: 이 일주를 한마디로 표현하는 캐치프레이즈 (예: "황금 말: 추진력 있는 도전적인 불도저", "은빛 토끼: 섬세하고 감각적인 예술가")
- 이 일주(동물)를 가진 사람의 핵심 특성
- 이 일주의 상징적 의미와 타고난 기운
- 이 일주가 가진 독특한 매력 포인트

---

### 2. 오행 분석 (강한 기운: ${topTwoWuXing})

- **오행 분포 해석**: 전체적인 오행 균형 상태 분석
- **강한 오행의 특징** (${topTwoWuXing}):
  - 이 기운을 가진 사람의 성격적 특징
  - 이 기운이 강할 때의 장점
  - 이 기운이 과다할 때의 단점 및 주의점
  - 이 기운을 가진 사람이 스트레스 푸는 방법
- **약한 오행이 만드는 인생 과제** (${weakWuXing}):
  - 부족한 기운으로 인해 겪을 수 있는 어려움
  - 이를 보완하는 방법과 조언

---

### 3. 타고난 성격과 기질

- **핵심 성격**: 일간 ${result.dayMasterKorean}과 오행 분포를 바탕으로 한 성격 분석
- **강점**: 이 사주가 가진 타고난 장점 3-4가지 (구체적으로)
- **약점**: 주의해야 할 성향이나 습관 2-3가지
- **성격의 이면**: 겉으로 보이는 모습과 속마음의 차이

---

### 4. 대인관계

- **나의 인간관계 스타일**: 사람을 대하는 방식, 친구를 사귀는 패턴
- **나와 잘 맞는 성격**: 어떤 유형의 사람과 함께할 때 편안한지
- **나와 안 맞는 성격**: 갈등이 생기기 쉬운 유형과 그 이유
- **대인관계 조언**: 더 좋은 관계를 위해 의식하면 좋은 점

---

### 5. 적성과 직업, 사업운

- **어울리는 분야**: 이 사주에 맞는 업종/분야 (3-4개)
- **구체적인 직업 추천**: 실제 직업명으로 5-7개 추천
- **적성 유형**: 문과형 vs 이과형 vs 예체능형 분석
- **일하는 스타일**: 사업가형 vs 직장인형 vs 예술가형 vs 전문직형 중 어디에 가까운지
- **직업 선택 시 조언**

---

### 6. 성공운, 재물운

- **돈을 버는 스타일**: 꾸준한 월급형 vs 한방 투자형 vs 사업형 등
- **이 사주에 맞는 재테크/투자법**: 부동산, 주식, 코인, 배당투자, ETF, 적금, 경매 등 중에서 추천
- **성공운과 재물운이 가장 좋은 시기**: 나이대로 표현 (예: 30대 중반~40대 초반)
- **재물운을 끌어올리는 방법**: 이 사주에 맞는 구체적인 조언

---

### 7. 대운이 들어오는 시기

- 인생에서 가장 운이 좋은 시기들을 나이대로 정리
- 각 시기별 어떤 기회가 오는지 설명
- 예시: "10대 후반: 학업운 상승", "20대 중반: 첫 사회적 성공", "30대 초반: 재물운 폭발기"

---

### 8. 조심해야 할 시기

- 주의가 필요한 시기들을 나이대로 정리
- 각 시기별 어떤 부분을 조심해야 하는지
- 위기를 기회로 바꾸는 방법
- 예시: "20대 초반: 건강 관리 필요", "40대 후반: 재정 관리 주의"

---

### 9. 연애, 결혼운

- **연애 스타일**: 사랑에 빠지는 패턴, 연인에게 보이는 모습
- **이상형**: 사주적으로 잘 맞는 상대의 특성
- **결혼하기 좋은 시기**: 구체적인 나이대 또는 연도
- **연애/결혼 관련 조언**

---

### 10. 건강운

- **약한 부분 (신경 써야 할 곳)**: 이 사주를 가진 사람이 주의해야 할 신체 부위나 건강 이슈
- **강한 부분**: 타고난 건강한 부분 (예: "기관지가 튼튼하다", "소화력이 좋다")
- **건강 관리 조언**: 이 사주에 맞는 운동법, 식습관, 생활 습관

---

### 11. 이 사주와 어울리는 MBTI

- **이 사주를 가진 사람에게 많이 나타나는 MBTI**: 2-3가지와 그 이유
- **잘 맞는 MBTI**: 친구/연인으로 궁합이 좋은 유형 2-3가지
- **안 맞는 MBTI**: 갈등이 생기기 쉬운 유형 1-2가지와 그 이유

---

**응답 형식:**
- 마크다운 형식으로 작성
- 각 섹션 제목은 ### 으로 시작
- 핵심 내용은 **볼드** 처리
- 구체적인 예시와 실용적인 조언 포함
- 긍정적이되 현실적인 톤 유지`
}

export function buildYearlySajuPrompt(result: SajuResult, gender: string): string {
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

${currentYear}년 신년운세를 분석해주세요:

1. **올해의 핵심 요약** (2-3문장)
   - 올해를 한마디로 표현하면?
   - 올해의 키워드

2. **${currentYear}년 총운**
   - 전체적인 기조와 흐름
   - 상반기 vs 하반기 분위기

3. **월별 운세** (1월~12월)
   각 월마다:
   - 운세 점수 (1-5점)
   - 해당 월의 주요 흐름 (1-2문장)

4. **행운의 달과 주의할 달**
   - 가장 좋은 달 2-3개와 이유
   - 주의가 필요한 달 2-3개와 대처법

5. **카테고리별 운세**
   - 재물운: 흐름과 조언
   - 연애운: 흐름과 조언
   - 직장운: 흐름과 조언
   - 건강운: 흐름과 조언

6. **올해의 실천 조언**
   - 올해 꼭 해야 할 것 2-3가지

응답은 마크다운 형식으로 작성해주세요.`
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

위 두 사람의 사주를 비교하여 궁합을 분석해주세요:

1. **궁합 점수와 핵심 요약** (2-3문장)
   - 전체 궁합 점수 (100점 만점)
   - 두 사람의 관계를 한마디로 표현

2. **두 사람의 케미**
   - 서로에게 끌리는 포인트
   - 함께 있을 때 시너지

3. **오행 궁합 분석**
   - 두 사람의 오행이 서로 어떻게 보완/충돌하는지
   - 강한 오행과 약한 오행의 조합

4. **일간 궁합**
   - ${result1.dayMasterKorean}와 ${result2.dayMasterKorean}의 관계
   - 서로에게 미치는 영향

5. **관계에서 주의할 점**
   - 갈등이 생길 수 있는 상황
   - 이를 극복하는 방법

6. **${currentYear}년 두 사람의 관계운**
   - 올해 관계가 좋아지는 시기
   - 주의할 시기

7. **관계 발전을 위한 조언**
   - 함께 하면 좋은 활동
   - 서로를 이해하기 위한 팁

응답은 마크다운 형식으로 작성해주세요.`
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

연애운을 분석해주세요:

1. **연애 스타일**
   - 사랑에 빠지는 패턴
   - 연애할 때의 모습

2. **잘 맞는 상대**
   - 사주적으로 좋은 상대의 특성
   - 함께 있을 때 편한 유형

3. **연애에서 주의할 점**
   - 반복되는 연애 패턴
   - 의식하면 좋은 부분

4. **${currentYear}년 연애운**
   - 인연이 올 수 있는 시기
   - 관계 발전 포인트
   - 주의할 시기

5. **좋은 인연 만나는 팁**
   - 구체적인 장소/상황
   - 좋은 타이밍

응답은 마크다운 형식으로 작성해주세요.`
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

오늘의 운세를 **짧고 간결하게** 분석해주세요 (3-4문장):

1. **오늘의 총운** (1문장)
   - 오늘 하루의 전체적인 분위기

2. **행운 키워드** (1-2개)
   - 오늘의 행운 색상 또는 숫자 또는 방향

3. **오늘의 조언** (1-2문장)
   - 오늘 하면 좋은 일 또는 주의할 점

**중요: 전체 응답을 4문장 이내로 간결하게 작성해주세요.**
응답은 마크다운 형식으로 작성해주세요.`
}
