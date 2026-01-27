'use client'

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

// 점수 바 컴포넌트
function ScoreBar({ score, label }: { score: number; label?: string }) {
  const barColor = score >= 70 ? 'bg-pink-500' : score >= 40 ? 'bg-yellow-500' : 'bg-gray-400'

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-small text-text-muted">{label}</span>
          <span className="text-small font-bold text-text">{score}점</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
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
            <div className="w-20 h-3 bg-gray-100 rounded-full overflow-hidden flex justify-end">
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
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: WUXING_COLORS[element] }}
          >
            {WUXING_KOREAN[element]}
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="w-20 h-3 bg-gray-100 rounded-full overflow-hidden">
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
  const score = interpretation?.summary.score || 50

  return (
    <div className="space-y-6">
      {/* 두 사람 요약 카드 */}
      <Card variant="highlighted">
        <div className="flex items-center justify-center gap-4 mb-4">
          <PersonCard result={result1} name={name1} gender={gender1} />
          <span className="text-3xl">💕</span>
          <PersonCard result={result2} name={name2} gender={gender2} />
        </div>
      </Card>

      {interpretation ? (
        <>
          {/* 총 요약 섹션 */}
          <Card>
            <div className="text-center mb-4">
              {/* 관계 태그 */}
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-100 to-red-100 rounded-full mb-3">
                <span className="text-xl font-bold text-pink-600">
                  {interpretation.summary.relationshipTag}
                </span>
                <span className="text-pink-400 ml-2">
                  ({interpretation.summary.tagDescription})
                </span>
              </div>

              {/* 종합 점수 */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-primary">{score}</span>
                <span className="text-2xl text-text-muted">/ 100</span>
              </div>
              <p className="text-lg font-semibold text-pink-500 mb-4">
                {interpretation.summary.ranking}
              </p>

              {/* 장단점 요약 */}
              <div className="grid grid-cols-1 gap-2 text-left">
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold text-green-600">👍 Good: </span>
                  <span className="text-text-muted">{interpretation.summary.good}</span>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-500">👎 Bad: </span>
                  <span className="text-text-muted">{interpretation.summary.bad}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 스킨십 & 본능적 끌림 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              🔥 스킨십 & 본능적 끌림
            </h3>

            {/* 끌림 지수 */}
            <div className="mb-4">
              <ScoreBar score={interpretation.physical.attractionScore} label="본능적 끌림 지수" />
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.physical.attractionDescription}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-1">🌙 낮져밤이 스타일</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.physical.intimacyStyle}
                </p>
              </div>
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
          </Card>

          {/* 갈등 & 해결 솔루션 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              ⚡ 갈등 & 해결 솔루션
            </h3>

            {/* 주요 싸움 원인 */}
            <div className="mb-4">
              <h4 className="font-semibold text-orange-600 mb-2">🎯 주요 싸움 원인</h4>
              <div className="flex flex-wrap gap-2">
                {interpretation.conflict.triggers.map((trigger, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-small"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>

            {/* 화해 매뉴얼 */}
            <div className="p-4 bg-green-50 rounded-xl mb-4">
              <h4 className="font-semibold text-green-600 mb-2">🕊️ 화해 매뉴얼</h4>
              <p className="text-body text-text-muted leading-relaxed">
                {interpretation.conflict.reconciliation}
              </p>
            </div>

            {/* 서로의 역할 */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-1">
                  {name1}님의 역할
                </h4>
                <p className="text-small text-text-muted">
                  {interpretation.conflict.roles.myRole}
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-600 mb-1">
                  {name2}님의 역할
                </h4>
                <p className="text-small text-text-muted">
                  {interpretation.conflict.roles.partnerRole}
                </p>
              </div>
            </div>
          </Card>

          {/* 결혼 & 미래 가능성 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              💍 결혼 & 미래 가능성
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <h4 className="font-semibold text-pink-600 mb-2">결혼 전망</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.future.marriageProspect}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl">
                <h4 className="font-semibold text-green-600 mb-2">재물운/자녀운 시너지</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.future.synergy}
                </p>
              </div>
            </div>
          </Card>

          {/* 속마음 & 성향 분석 */}
          <Card variant="highlighted">
            <h3 className="text-subheading font-semibold text-text mb-4">
              💭 속마음 & 성향 분석
            </h3>
            <div className="space-y-4">
              {/* 애정도 밸런스 */}
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-red-500 mb-2">❤️ 누가 더 사랑할까?</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotional.loveBalance}
                </p>
              </div>

              {/* 티키타카 */}
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-blue-500 mb-2">💬 티키타카 (소통 스타일)</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotional.communication}
                </p>
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
}: {
  result1: SajuResult
  result2: SajuResult
  name1: string
  name2: string
}) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💑 궁합 분석
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {name1}님의 <span className="font-semibold text-primary">{result1.dayMasterKorean}</span>와
          {name2}님의 <span className="font-semibold text-primary">{result2.dayMasterKorean}</span>의 궁합을 분석 중입니다.
        </p>
      </Card>
    </div>
  )
}
