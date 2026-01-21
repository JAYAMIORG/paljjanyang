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
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
}

// 일간 오행 이모지 매핑
const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

interface CompatibilityResultContentProps {
  result1: SajuResult
  result2: SajuResult
  name1: string
  name2: string
  gender1: string
  gender2: string
  interpretation: string | null
}

interface ParsedCompatibilityInterpretation {
  score: number | null
  summary: string | null
  chemistry: string | null
  wuxingAnalysis: string | null
  dayMasterAnalysis: string | null
  cautions: string | null
  yearlyFortune: string | null
  advice: string | null
}

// 궁합 해석 파싱
function parseCompatibilityInterpretation(markdown: string): ParsedCompatibilityInterpretation {
  const result: ParsedCompatibilityInterpretation = {
    score: null,
    summary: null,
    chemistry: null,
    wuxingAnalysis: null,
    dayMasterAnalysis: null,
    cautions: null,
    yearlyFortune: null,
    advice: null,
  }

  // 점수 추출
  const scoreMatch = markdown.match(/(\d{1,3})점/)
  if (scoreMatch) {
    result.score = parseInt(scoreMatch[1])
  }

  const sections = markdown.split(/(?=^#{1,3}\s)/m)

  for (const section of sections) {
    const lines = section.trim().split('\n')
    const headerMatch = lines[0]?.match(/^#{1,3}\s+(.+)$/)
    if (!headerMatch) continue

    const title = headerMatch[1].toLowerCase()
    const content = lines.slice(1).join('\n').trim()

    if (title.includes('점수') || title.includes('핵심') || title.includes('요약')) {
      result.summary = content
      // 점수가 없으면 내용에서 추출
      if (!result.score) {
        const contentScoreMatch = content.match(/(\d{1,3})점/)
        if (contentScoreMatch) {
          result.score = parseInt(contentScoreMatch[1])
        }
      }
    }
    else if (title.includes('케미') || title.includes('시너지') || title.includes('끌리')) {
      result.chemistry = content
    }
    else if (title.includes('오행')) {
      result.wuxingAnalysis = content
    }
    else if (title.includes('일간')) {
      result.dayMasterAnalysis = content
    }
    else if (title.includes('주의') || title.includes('갈등')) {
      result.cautions = content
    }
    else if (title.includes('운') && (title.includes('올해') || title.includes('년'))) {
      result.yearlyFortune = content
    }
    else if (title.includes('조언') || title.includes('발전')) {
      result.advice = content
    }
  }

  return result
}

// 오행 조화 점수 계산 (간단한 버전)
function calculateWuxingHarmony(wuxing1: SajuResult['wuXing'], wuxing2: SajuResult['wuXing']): number {
  // 상생 관계 체크 (목->화->토->금->수->목)
  // 두 사람의 오행 분포가 서로 보완적인지 확인
  let harmony = 50 // 기본 점수

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const

  for (const elem of elements) {
    const diff = Math.abs(wuxing1[elem] - wuxing2[elem])
    // 차이가 적으면 조화로움
    if (diff < 10) harmony += 5
    // 한쪽이 부족한 것을 다른 쪽이 보완
    if ((wuxing1[elem] < 15 && wuxing2[elem] > 20) || (wuxing2[elem] < 15 && wuxing1[elem] > 20)) {
      harmony += 3
    }
  }

  return Math.min(100, Math.max(0, harmony))
}

// 점수에 따른 등급 표시
function ScoreGrade({ score }: { score: number }) {
  let grade = ''
  let color = ''
  let emoji = ''

  if (score >= 90) {
    grade = '천생연분'
    color = 'text-pink-500'
    emoji = '💕'
  } else if (score >= 80) {
    grade = '아주 좋음'
    color = 'text-red-500'
    emoji = '❤️'
  } else if (score >= 70) {
    grade = '좋음'
    color = 'text-orange-500'
    emoji = '🧡'
  } else if (score >= 60) {
    grade = '보통'
    color = 'text-yellow-500'
    emoji = '💛'
  } else if (score >= 50) {
    grade = '노력 필요'
    color = 'text-blue-500'
    emoji = '💙'
  } else {
    grade = '많은 노력 필요'
    color = 'text-gray-500'
    emoji = '🤍'
  }

  return (
    <div className="text-center">
      <span className="text-4xl block mb-2">{emoji}</span>
      <span className={`text-lg font-semibold ${color}`}>{grade}</span>
    </div>
  )
}

// 개인 카드 컴포넌트
function PersonCard({
  result,
  name,
  gender,
}: {
  result: SajuResult
  name: string
  gender: string
}) {
  const emoji = DAY_MASTER_EMOJI[result.dayMaster] || '🐱'
  const genderEmoji = gender === 'male' ? '♂' : '♀'
  const genderColor = gender === 'male' ? 'text-blue-500' : 'text-pink-500'

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-2xl">{emoji}</span>
        <span className={`text-lg ${genderColor}`}>{genderEmoji}</span>
      </div>
      <p className="font-semibold text-text truncate">{name}</p>
      <p className="text-small text-primary">{result.dayMasterKorean}</p>
      <p className="text-caption text-text-muted mt-1">
        {result.koreanGanji.split(' ')[0]}
      </p>
    </div>
  )
}

// 오행 비교 차트
function WuxingComparison({
  wuxing1,
  wuxing2,
  name1,
  name2,
}: {
  wuxing1: SajuResult['wuXing']
  wuxing2: SajuResult['wuXing']
  name1: string
  name2: string
}) {
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-small text-text-muted mb-2">
        <span>{name1}</span>
        <span>{name2}</span>
      </div>
      {elements.map((element) => (
        <div key={element} className="flex items-center gap-2">
          {/* 첫 번째 사람 */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="text-small text-text-muted">{wuxing1[element]}%</span>
            <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden flex justify-end">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${wuxing1[element]}%`,
                  backgroundColor: WUXING_COLORS[element],
                }}
              />
            </div>
          </div>

          {/* 오행 이름 */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-small font-bold flex-shrink-0"
            style={{ backgroundColor: WUXING_COLORS[element] }}
          >
            {WUXING_KOREAN[element]}
          </div>

          {/* 두 번째 사람 */}
          <div className="flex-1 flex items-center gap-2">
            <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${wuxing2[element]}%`,
                  backgroundColor: WUXING_COLORS[element],
                }}
              />
            </div>
            <span className="text-small text-text-muted">{wuxing2[element]}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function CompatibilityResultContent({
  result1,
  result2,
  name1,
  name2,
  gender1,
  gender2,
  interpretation,
}: CompatibilityResultContentProps) {
  // 해석 파싱 (memoize하여 불필요한 재계산 방지)
  const parsed = useMemo(() => {
    return interpretation ? parseCompatibilityInterpretation(interpretation) : null
  }, [interpretation])

  // 점수 결정 (LLM 해석에서 추출하거나 오행 조화로 계산)
  const score = useMemo(() => {
    return parsed?.score || calculateWuxingHarmony(result1.wuXing, result2.wuXing)
  }, [parsed?.score, result1.wuXing, result2.wuXing])

  return (
    <div className="space-y-6">
      {/* 두 사람 요약 카드 */}
      <Card variant="highlighted">
        <div className="flex items-center justify-center gap-4 mb-4">
          <PersonCard result={result1} name={name1} gender={gender1} />
          <span className="text-3xl">💕</span>
          <PersonCard result={result2} name={name2} gender={gender2} />
        </div>

        {/* 궁합 점수 */}
        <div className="text-center py-4 border-t border-gray-100">
          <p className="text-small text-text-muted mb-2">궁합 점수</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-bold text-primary">{score}</span>
            <span className="text-2xl text-text-muted">/ 100</span>
          </div>
          <div className="mt-3">
            <ScoreGrade score={score} />
          </div>
        </div>
      </Card>

      {/* 핵심 요약 */}
      {parsed?.summary && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            💑 궁합 핵심 요약
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.summary}
          </p>
        </Card>
      )}

      {/* 오행 비교 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-4">
          🔮 오행 궁합
        </h3>
        <WuxingComparison
          wuxing1={result1.wuXing}
          wuxing2={result2.wuXing}
          name1={name1}
          name2={name2}
        />
        {parsed?.wuxingAnalysis && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
              {parsed.wuxingAnalysis}
            </p>
          </div>
        )}
      </Card>

      {/* 케미 */}
      {parsed?.chemistry && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            ✨ 두 사람의 케미
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.chemistry}
          </p>
        </Card>
      )}

      {/* 일간 궁합 */}
      {parsed?.dayMasterAnalysis && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            🌟 일간 궁합
          </h3>
          <div className="flex justify-center gap-4 mb-4">
            <div className="text-center">
              <span className="text-2xl">{DAY_MASTER_EMOJI[result1.dayMaster] || '🐱'}</span>
              <p className="text-small text-primary mt-1">{result1.dayMasterKorean}</p>
            </div>
            <span className="text-2xl">↔️</span>
            <div className="text-center">
              <span className="text-2xl">{DAY_MASTER_EMOJI[result2.dayMaster] || '🐱'}</span>
              <p className="text-small text-primary mt-1">{result2.dayMasterKorean}</p>
            </div>
          </div>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.dayMasterAnalysis}
          </p>
        </Card>
      )}

      {/* 주의할 점 */}
      {parsed?.cautions && (
        <Card>
          <h3 className="text-subheading font-semibold text-orange-500 mb-3">
            ⚠️ 주의할 점
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.cautions}
          </p>
        </Card>
      )}

      {/* 올해 관계운 */}
      {parsed?.yearlyFortune && (
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            📅 올해 두 사람의 관계운
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.yearlyFortune}
          </p>
        </Card>
      )}

      {/* 조언 */}
      {parsed?.advice && (
        <Card variant="highlighted">
          <h3 className="text-subheading font-semibold text-text mb-3">
            💡 관계 발전을 위한 조언
          </h3>
          <p className="text-body text-text-muted leading-relaxed whitespace-pre-wrap">
            {parsed.advice}
          </p>
        </Card>
      )}

      {/* 폴백: 파싱 실패 시 원본 표시 */}
      {interpretation && !parsed?.summary && !parsed?.chemistry && (
        <CompatibilityFallbackInterpretation content={interpretation} />
      )}

      {/* 해석 없을 때 */}
      {!interpretation && (
        <CompatibilityDefaultContent
          result1={result1}
          result2={result2}
          name1={name1}
          name2={name2}
          score={score}
        />
      )}
    </div>
  )
}

// 파싱 실패 시 원본 표시
function CompatibilityFallbackInterpretation({ content }: { content: string }) {
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

// 해석 없을 때 기본 콘텐츠
function CompatibilityDefaultContent({
  result1,
  result2,
  name1,
  name2,
  score,
}: {
  result1: SajuResult
  result2: SajuResult
  name1: string
  name2: string
  score: number
}) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💑 궁합 분석
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {name1}님의 <span className="font-semibold text-primary">{result1.dayMasterKorean}</span>와
          {name2}님의 <span className="font-semibold text-primary">{result2.dayMasterKorean}</span>의 궁합은
          {score >= 70 ? ' 좋은 편입니다.' : score >= 50 ? ' 보통입니다.' : ' 노력이 필요합니다.'}
        </p>
        <p className="text-body text-text-muted leading-relaxed mt-2">
          두 사람은 서로 다른 오행의 에너지를 가지고 있어,
          서로를 이해하고 보완하는 관계가 될 수 있습니다.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💡 조언
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          궁합은 참고사항일 뿐, 두 사람의 노력이 가장 중요합니다.
          서로를 존중하고 이해하려는 마음이 좋은 관계의 기반이 됩니다.
        </p>
      </Card>
    </div>
  )
}
