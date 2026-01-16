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
  const currentYear = new Date().getFullYear()

  return `## 사주 정보

성별: ${gender === 'male' ? '남성' : '여성'}
사주: ${result.koreanGanji}
일간: ${result.dayMaster} (${result.dayMasterKorean})
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

### 십신
- 년간: ${result.shiShen.yearGan}
- 월간: ${result.shiShen.monthGan}
- 시간: ${result.shiShen.hourGan || '미상'}

### 대운
${result.daYun.slice(0, 6).map(dy =>
  `- ${dy.startAge}~${dy.endAge}세: ${dy.ganZhi}`
).join('\n')}

---

## 요청

위 사주 정보를 바탕으로 다음 항목을 해석해주세요:

1. **핵심 요약** (2-3문장)
   - 이 사람의 사주를 한마디로 표현하면?

2. **타고난 성격과 기질**
   - 일간과 오행 분포를 바탕으로 해석
   - 강점과 주의할 성향

3. **적성과 진로**
   - 어울리는 분야, 일하는 스타일
   - 구체적인 직업/업종 예시

4. **대인관계**
   - 인간관계 스타일
   - 잘 맞는 유형, 주의할 관계

5. **${currentYear}년 운세**
   - 올해의 전체적인 흐름
   - 좋은 시기와 주의할 시기

6. **실천 조언**
   - 지금 할 수 있는 구체적인 행동 2-3가지

응답은 마크다운 형식으로 작성해주세요.`
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
