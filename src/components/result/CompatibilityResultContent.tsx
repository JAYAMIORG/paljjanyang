'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui'
import type { SajuResult } from '@/types/saju'
import type { CompatibilityInterpretation } from '@/types/interpretation'

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
  interpretation: CompatibilityInterpretation | null
}

// 오행 조화 점수 계산 (간단한 버전)
function calculateWuxingHarmony(wuxing1: SajuResult['wuXing'], wuxing2: SajuResult['wuXing']): number {
  let harmony = 50

  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const

  for (const elem of elements) {
    const diff = Math.abs(wuxing1[elem] - wuxing2[elem])
    if (diff < 10) harmony += 5
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

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-small font-bold flex-shrink-0"
            style={{ backgroundColor: WUXING_COLORS[element] }}
          >
            {WUXING_KOREAN[element]}
          </div>

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
  // 점수 결정 (LLM 해석에서 가져오거나 계산)
  const score = useMemo(() => {
    return interpretation?.summary.score || calculateWuxingHarmony(result1.wuXing, result2.wuXing)
  }, [interpretation?.summary.score, result1.wuXing, result2.wuXing])

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

      {interpretation ? (
        <>
          {/* 핵심 요약 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              💑 궁합 핵심 요약
            </h3>
            <p className="text-lg font-medium text-primary mb-2">
              "{interpretation.summary.oneLine}"
            </p>
            <p className="text-body text-text-muted leading-relaxed">
              {interpretation.summary.description}
            </p>
          </Card>

          {/* 두 사람의 케미 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              ✨ 두 사람의 케미
            </h3>
            <div className="space-y-3 text-body text-text-muted leading-relaxed">
              <p><strong className="text-primary">끌리는 포인트:</strong> {interpretation.chemistry.attraction}</p>
              <p><strong className="text-primary">시너지:</strong> {interpretation.chemistry.synergy}</p>
            </div>
          </Card>

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
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-body text-text-muted leading-relaxed">
                {interpretation.wuXingMatch.analysis}
              </p>
              <p className="text-body text-text-muted leading-relaxed">
                {interpretation.wuXingMatch.meaning}
              </p>
            </div>
          </Card>

          {/* 일주 동물 궁합 */}
          {result1.dayPillarAnimal && result2.dayPillarAnimal && (
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-4">
                🐾 일주 동물 궁합
              </h3>
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-serif mb-1">{result1.bazi.day}</p>
                    <p className="text-lg font-bold text-primary">{result1.dayPillarAnimal}</p>
                    <p className="text-caption text-text-muted">{name1}</p>
                  </div>
                  <span className="text-3xl">❤️</span>
                  <div className="text-center">
                    <p className="text-2xl font-serif mb-1">{result2.bazi.day}</p>
                    <p className="text-lg font-bold text-primary">{result2.dayPillarAnimal}</p>
                    <p className="text-caption text-text-muted">{name2}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 일간 궁합 */}
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
            <div className="space-y-2 text-body text-text-muted leading-relaxed">
              <p>{interpretation.dayMasterMatch.relationship}</p>
              <p>{interpretation.dayMasterMatch.influence}</p>
            </div>
          </Card>

          {/* 주의할 점 */}
          <Card>
            <h3 className="text-subheading font-semibold text-orange-500 mb-3">
              ⚠️ 주의할 점
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-1">갈등 상황</h4>
                <p className="text-body text-text-muted">{interpretation.cautions.conflicts}</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-primary mb-1">극복 방법</h4>
                <p className="text-body text-text-muted">{interpretation.cautions.solutions}</p>
              </div>
            </div>
          </Card>

          {/* 올해 관계운 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              📅 올해 두 사람의 관계운
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-600 mb-1">좋아지는 시기</h4>
                <p className="text-small text-text-muted">{interpretation.yearlyOutlook.goodPeriod}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-1">주의할 시기</h4>
                <p className="text-small text-text-muted">{interpretation.yearlyOutlook.cautionPeriod}</p>
              </div>
            </div>
          </Card>

          {/* 조언 */}
          <Card variant="highlighted">
            <h3 className="text-subheading font-semibold text-text mb-3">
              💡 관계 발전을 위한 조언
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text mb-2">함께 하면 좋은 활동</h4>
                <ul className="space-y-1">
                  {interpretation.advice.activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2 text-body text-text-muted">
                      <span className="text-primary">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-text mb-2">서로를 이해하기 위한 팁</h4>
                <ul className="space-y-1">
                  {interpretation.advice.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-body text-text-muted">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </>
      ) : (
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
