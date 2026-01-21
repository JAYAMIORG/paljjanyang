'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui'
import type { SajuResult } from '@/types/saju'

const WUXING_COLORS: Record<string, string> = {
  wood: '#7FB069',
  fire: '#FF6B6B',
  earth: '#FFB366',
  metal: '#A8A8A8',
  water: '#4ECDC4',
}

const WUXING_KOREAN: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

// 일간 오행 이모지 매핑
const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

// 월별 이모지
const MONTH_EMOJI: Record<number, string> = {
  1: '❄️', 2: '💝', 3: '🌸', 4: '🌷',
  5: '🌿', 6: '☀️', 7: '🌊', 8: '🌻',
  9: '🍂', 10: '🎃', 11: '🍁', 12: '🎄',
}

// 카테고리 아이콘
const CATEGORY_ICONS: Record<string, string> = {
  '재물운': '💰',
  '연애운': '💕',
  '직장운': '💼',
  '건강운': '💪',
}

interface YearlyResultContentProps {
  result: SajuResult
  interpretation: string | null
}

interface MonthlyFortune {
  month: number
  score: number
  content: string
}

interface CategoryFortune {
  category: string
  content: string
}

interface ParsedYearlyInterpretation {
  summary: string | null
  yearOverview: string | null
  monthlyFortunes: MonthlyFortune[]
  luckyMonths: string | null
  cautionMonths: string | null
  categories: CategoryFortune[]
  advice: string | null
}

// 신년운세 마크다운 파싱
function parseYearlyInterpretation(markdown: string): ParsedYearlyInterpretation {
  const result: ParsedYearlyInterpretation = {
    summary: null,
    yearOverview: null,
    monthlyFortunes: [],
    luckyMonths: null,
    cautionMonths: null,
    categories: [],
    advice: null,
  }

  const sections = markdown.split(/(?=^#{1,3}\s)/m)

  for (const section of sections) {
    const lines = section.trim().split('\n')
    const headerMatch = lines[0]?.match(/^#{1,3}\s+(.+)$/)
    if (!headerMatch) continue

    const title = headerMatch[1].toLowerCase()
    const content = lines.slice(1).join('\n').trim()

    // 핵심 요약
    if (title.includes('핵심') || title.includes('요약')) {
      result.summary = content
    }
    // 총운
    else if (title.includes('총운') || title.includes('전체')) {
      result.yearOverview = content
    }
    // 월별 운세
    else if (title.includes('월별')) {
      result.monthlyFortunes = parseMonthlyFortunes(content)
    }
    // 행운의 달
    else if (title.includes('행운') || title.includes('좋은 달')) {
      result.luckyMonths = content
    }
    // 주의할 달
    else if (title.includes('주의')) {
      result.cautionMonths = content
    }
    // 카테고리별 운세
    else if (title.includes('카테고리') || title.includes('분야별')) {
      result.categories = parseCategoryFortunes(content)
    }
    // 개별 카테고리 (재물운, 연애운 등)
    else if (title.includes('재물')) {
      result.categories.push({ category: '재물운', content })
    }
    else if (title.includes('연애')) {
      result.categories.push({ category: '연애운', content })
    }
    else if (title.includes('직장') || title.includes('커리어')) {
      result.categories.push({ category: '직장운', content })
    }
    else if (title.includes('건강')) {
      result.categories.push({ category: '건강운', content })
    }
    // 실천 조언
    else if (title.includes('조언') || title.includes('실천')) {
      result.advice = content
    }
  }

  // 월별 운세가 없으면 본문에서 파싱 시도
  if (result.monthlyFortunes.length === 0) {
    result.monthlyFortunes = parseMonthlyFortunesFromText(markdown)
  }

  return result
}

// 월별 운세 파싱
function parseMonthlyFortunes(content: string): MonthlyFortune[] {
  const fortunes: MonthlyFortune[] = []

  // 각 월을 개별적으로 찾기
  for (let month = 1; month <= 12; month++) {
    // 여러 패턴 시도
    const patterns = [
      // "1월: 3점 - 내용" 또는 "1월 - 내용" 형태
      new RegExp(`\\b${month}월[:\\s]*(?:(\\d)[점]?[:\\s]*)?([^\\n]+)`, 'i'),
      // "**1월** 3점: 내용" 형태 (마크다운)
      new RegExp(`\\*\\*${month}월\\*\\*[:\\s]*(?:(\\d)[점]?[:\\s]*)?([^\\n]+)`, 'i'),
      // "- 1월: 내용" 리스트 형태
      new RegExp(`[-•]\\s*${month}월[:\\s]*(?:(\\d)[점]?[:\\s]*)?([^\\n]+)`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[2]) {
        fortunes.push({
          month,
          score: match[1] ? parseInt(match[1]) : 3,
          content: match[2].trim().replace(/^\s*[-:]\s*/, ''),
        })
        break
      }
    }
  }

  // 12개 미만이면 기본값으로 채우기
  if (fortunes.length > 0 && fortunes.length < 12) {
    for (let m = 1; m <= 12; m++) {
      if (!fortunes.find(f => f.month === m)) {
        fortunes.push({ month: m, score: 3, content: '평온한 흐름이 예상됩니다.' })
      }
    }
  }

  return fortunes.sort((a, b) => a.month - b.month)
}

// 텍스트에서 월별 운세 추출 (대안)
function parseMonthlyFortunesFromText(text: string): MonthlyFortune[] {
  const fortunes: MonthlyFortune[] = []

  for (let month = 1; month <= 12; month++) {
    const patterns = [
      new RegExp(`${month}월[\\s:]+([^\\n]+)`, 'i'),
      new RegExp(`\\*\\*${month}월\\*\\*[\\s:]+([^\\n]+)`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const scoreMatch = match[1].match(/(\d)[점]/);
        fortunes.push({
          month,
          score: scoreMatch ? parseInt(scoreMatch[1]) : 3,
          content: match[1].replace(/\d점[:\s]*/g, '').trim(),
        })
        break
      }
    }
  }

  return fortunes
}

// 카테고리별 운세 파싱
function parseCategoryFortunes(content: string): CategoryFortune[] {
  const categories: CategoryFortune[] = []
  const categoryNames = ['재물운', '연애운', '직장운', '건강운']

  for (const cat of categoryNames) {
    // 's' 플래그 대신 [\s\S]* 사용하여 멀티라인 매칭
    const pattern = new RegExp(`[-•]?\\s*${cat}[:\\s]+([^\\n]+(?:\\n(?![-•]\\s*\\w+운)[^\\n]*)*)`, 'i')
    const match = content.match(pattern)
    if (match) {
      categories.push({ category: cat, content: match[1].trim() })
    }
  }

  return categories
}

// 점수를 별로 표시
function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-sm ${i <= score ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function YearlyResultContent({ result, interpretation }: YearlyResultContentProps) {
  const currentYear = new Date().getFullYear()
  const dayMasterEmoji = DAY_MASTER_EMOJI[result.dayMaster] || '🐱'

  // 해석 파싱 (memoize하여 불필요한 재계산 방지)
  const parsed = useMemo(() => {
    return interpretation ? parseYearlyInterpretation(interpretation) : null
  }, [interpretation])

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <Card variant="highlighted">
        <div className="text-center">
          <span className="text-5xl mb-3 block">{dayMasterEmoji}</span>
          <h2 className="text-heading font-semibold text-text mb-2">
            {result.dayMasterKorean}의 {currentYear}년
          </h2>
          <p className="text-body text-text-muted">
            {result.koreanGanji}
          </p>
        </div>

        {/* 오행 미니 차트 */}
        <div className="mt-6 flex justify-center gap-2">
          {(Object.entries(result.wuXing) as [keyof typeof result.wuXing, number][]).map(
            ([element, value]) => (
              <div
                key={element}
                className="flex flex-col items-center"
                style={{ opacity: value > 10 ? 1 : 0.4 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-small font-bold"
                  style={{ backgroundColor: WUXING_COLORS[element] }}
                >
                  {value}
                </div>
                <span className="text-caption text-text-light mt-1">
                  {WUXING_KOREAN[element].charAt(0)}
                </span>
              </div>
            )
          )}
        </div>
      </Card>

      {/* 핵심 요약 */}
      {parsed?.summary && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            🎯 {currentYear}년 핵심 요약
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.summary}
          </p>
        </Card>
      )}

      {/* 총운 */}
      {parsed?.yearOverview && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            📅 {currentYear}년 총운
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.yearOverview}
          </p>
        </Card>
      )}

      {/* 월별 운세 */}
      {parsed && parsed.monthlyFortunes.length > 0 && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            📆 월별 운세
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {parsed.monthlyFortunes.map((fortune) => (
              <div
                key={fortune.month}
                className={`
                  p-3 rounded-xl border transition-all
                  ${fortune.score >= 4
                    ? 'bg-green-50 border-green-200'
                    : fortune.score <= 2
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-text">
                    {MONTH_EMOJI[fortune.month]} {fortune.month}월
                  </span>
                  <ScoreStars score={fortune.score} />
                </div>
                <p className="text-small text-text-muted line-clamp-2">
                  {fortune.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 행운의 달 & 주의할 달 */}
      {(parsed?.luckyMonths || parsed?.cautionMonths) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {parsed.luckyMonths && (
            <Card>
              <h3 className="text-subheading font-semibold text-green-600 mb-3">
                🍀 행운의 달
              </h3>
              <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
                {parsed.luckyMonths}
              </p>
            </Card>
          )}
          {parsed.cautionMonths && (
            <Card>
              <h3 className="text-subheading font-semibold text-orange-500 mb-3">
                ⚠️ 주의할 달
              </h3>
              <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
                {parsed.cautionMonths}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* 카테고리별 운세 */}
      {parsed && parsed.categories.length > 0 && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-4">
            🔮 분야별 운세
          </h3>
          <div className="space-y-4">
            {parsed.categories.map((cat) => (
              <div
                key={cat.category}
                className="p-4 bg-background-secondary rounded-xl"
              >
                <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat.category] || '✨'}</span>
                  {cat.category}
                </h4>
                <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
                  {cat.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 실천 조언 */}
      {parsed?.advice && (
        <Card variant="highlighted">
          <h3 className="text-subheading font-semibold text-text mb-3">
            💡 올해의 실천 조언
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.advice}
          </p>
        </Card>
      )}

      {/* 폴백: 파싱 실패 시 원본 표시 */}
      {interpretation && !parsed?.summary && !parsed?.monthlyFortunes.length && (
        <YearlyFallbackInterpretation content={interpretation} />
      )}

      {/* 해석 없을 때 */}
      {!interpretation && (
        <YearlyDefaultContent result={result} />
      )}
    </div>
  )
}

// 파싱 실패 시 원본 마크다운 표시
function YearlyFallbackInterpretation({ content }: { content: string }) {
  const sections = content.split(/(?=^#{1,3}\s)/m).filter(s => s.trim())

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.trim().split('\n')
        const headerMatch = lines[0]?.match(/^#{1,3}\s+(.+)$/)
        const title = headerMatch ? headerMatch[1] : null
        const body = (headerMatch ? lines.slice(1) : lines).join('\n').trim()

        return (
          <Card key={index}>
            {title && (
              <h3 className="text-subheading font-semibold text-text mb-3">
                {title}
              </h3>
            )}
            <div className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
              {body}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// LLM 해석 없을 때 기본 콘텐츠
function YearlyDefaultContent({ result }: { result: SajuResult }) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          📅 {currentYear}년 총운
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {result.dayMasterKorean}의 기운을 가진 당신의 {currentYear}년은
          전반적으로 안정적인 흐름이 예상됩니다.
          상반기에는 준비와 계획에 집중하고, 하반기에는 실행에 옮기면 좋은 결과를 얻을 수 있어요.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💡 올해의 조언
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {result.dominantElement}의 기운이 강한 당신은 이를 잘 활용하면 좋은 기회가 찾아올 거예요.
          반면 {result.weakElement}이 부족하니 이 부분을 보완하는 활동에도 관심을 가져보세요.
        </p>
      </Card>
    </div>
  )
}
