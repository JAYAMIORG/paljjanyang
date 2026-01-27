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
  gender1?: string  // 현재 미사용
  gender2?: string  // 현재 미사용
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

// 오행 비교 차트
function WuxingComparison({
  wuxing1,
  wuxing2,
  name1,
  name2,
  dayMaster1,
  dayMaster2,
  dayMasterKorean1,
  dayMasterKorean2,
}: {
  wuxing1: SajuResult['wuXing']
  wuxing2: SajuResult['wuXing']
  name1: string
  name2: string
  dayMaster1?: string
  dayMaster2?: string
  dayMasterKorean1?: string
  dayMasterKorean2?: string
}) {
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const emoji1 = dayMaster1 ? (DAY_MASTER_EMOJI[dayMaster1] || '🐱') : ''
  const emoji2 = dayMaster2 ? (DAY_MASTER_EMOJI[dayMaster2] || '🐱') : ''

  return (
    <div className="space-y-3">
      {/* 일간 정보 포함된 헤더 - 오행 바와 동일한 3열 구조 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center justify-end gap-1">
          {emoji1 && <span className="text-lg">{emoji1}</span>}
          <span className="text-text font-semibold text-lg">{name1}</span>
          {dayMasterKorean1 && <span className="text-primary text-sm">({dayMasterKorean1})</span>}
        </div>
        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
          <span className="text-pink-500 text-xl">❤️</span>
        </div>
        <div className="flex-1 flex items-center gap-1">
          {dayMasterKorean2 && <span className="text-primary text-sm">({dayMasterKorean2})</span>}
          <span className="text-text font-semibold text-lg">{name2}</span>
          {emoji2 && <span className="text-lg">{emoji2}</span>}
        </div>
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
  interpretation,
}: CompatibilityResultContentProps) {
  const score = interpretation?.summary?.score || 50

  // 새 형식인지 확인 (확장된 섹션들이 있어야 함)
  const isNewFormat = interpretation &&
    interpretation.physical &&
    interpretation.conflict &&
    interpretation.future &&
    interpretation.emotional &&
    interpretation.emotionalExpression &&
    interpretation.powerBalance &&
    interpretation.warning &&
    interpretation.improvement

  return (
    <div className="space-y-6">
      {isNewFormat ? (
        <>
          {/* 오행 궁합 - 맨 위로 이동 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              🔮 오행 궁합
            </h3>
            <WuxingComparison
              wuxing1={result1.wuXing}
              wuxing2={result2.wuXing}
              name1={name1}
              name2={name2}
              dayMaster1={result1.dayMaster}
              dayMaster2={result2.dayMaster}
              dayMasterKorean1={result1.dayMasterKorean}
              dayMasterKorean2={result2.dayMasterKorean}
            />
          </Card>

          {/* 총 요약 섹션 */}
          <Card>
            <div className="text-center mb-4">
              {/* 관계 태그 */}
              <div className="w-full px-4 py-4 bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl mb-3">
                <div className="text-2xl font-bold text-pink-600">
                  {interpretation.summary.relationshipTag}
                </div>
                <div className="text-pink-400 text-base mt-1">
                  ({interpretation.summary.tagDescription})
                </div>
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

            <div className="mb-4">
              <ScoreBar score={interpretation.physical.attractionScore} label="본능적 끌림 지수" />
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.physical.attractionDescription}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <h4 className="font-semibold text-purple-600 mb-2">🌙 낮져밤이 스타일</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.physical.intimacyStyle}
                </p>
              </div>
            </div>
          </Card>

          {/* 감정 표현 방식 & 교류 궁합 - 핵심 섹션 */}
          <Card variant="highlighted">
            <h3 className="text-subheading font-semibold text-text mb-2">
              💗 감정 표현 & 교류 궁합
            </h3>
            <p className="text-small text-pink-500 mb-4">
              ⭐ 이게 맞으면 웬만한 문제는 넘기고, 안 맞으면 사소한 일로 무너져요
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-rose-500 mb-2">🎭 감정 표현 방식의 차이</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotionalExpression.expressionDiff}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-violet-500 mb-2">🤗 공감/위로 스타일</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotionalExpression.empathyStyle}
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-pink-500 mb-2">💌 사랑의 언어 궁합</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotionalExpression.loveLanguage}
                </p>
              </div>
            </div>
          </Card>

          {/* 주도권 & 힘의 균형 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-2">
              ⚖️ 주도권 & 힘의 균형
            </h3>
            <p className="text-small text-orange-500 mb-4">
              ⭐ 힘의 균형이 무너지면 아무리 좋아도 오래 못 가요
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <h4 className="font-semibold text-amber-600 mb-2">📊 주도권 비율</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.powerBalance.balanceRatio}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-semibold text-orange-600 mb-2">🎯 결정권 분배</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.powerBalance.decisionMaking}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-semibold text-yellow-600 mb-2">🔮 시간이 지나면?</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.powerBalance.futureShift}
                </p>
              </div>
            </div>
          </Card>

          {/* 속마음 & 성향 분석 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              💭 속마음 & 성향 분석
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <h4 className="font-semibold text-red-500 mb-2">❤️ 누가 더 사랑할까?</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotional.loveBalance}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-500 mb-2">💬 티키타카 (소통 스타일)</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.emotional.communication}
                </p>
              </div>
            </div>
          </Card>

          {/* 갈등 & 해결 솔루션 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              ⚡ 갈등 & 해결 솔루션
            </h3>

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

            <div className="p-4 bg-green-50 rounded-xl mb-4">
              <h4 className="font-semibold text-green-600 mb-2">🕊️ 화해 매뉴얼</h4>
              <p className="text-body text-text-muted leading-relaxed">
                {interpretation.conflict.reconciliation}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-1">
                  {name1}이(가) {name2}에게 되어주는 역할
                </h4>
                <p className="text-small text-text-muted">
                  {interpretation.conflict.roles.myRole}
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-600 mb-1">
                  {name2}이(가) {name1}에게 되어주는 역할
                </h4>
                <p className="text-small text-text-muted">
                  {interpretation.conflict.roles.partnerRole}
                </p>
              </div>
            </div>
          </Card>

          {/* 위험 신호 & 주의 구간 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-2">
              ⚠️ 위험 신호 & 주의 구간
            </h3>
            <p className="text-small text-gray-500 mb-4">
              공포 조장이 아닌 현실적인 위험 관리 포인트
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <h4 className="font-semibold text-red-600 mb-2">🔄 반복될 수 있는 문제</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.warning.recurringIssues}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl">
                <h4 className="font-semibold text-amber-600 mb-2">📅 특히 주의할 시기</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.warning.dangerousPeriods}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-600 mb-2">🌍 외부 변수의 영향</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.warning.externalFactors}
                </p>
              </div>
            </div>
          </Card>

          {/* 궁합 개선 전략 - 가장 중요 */}
          <Card variant="highlighted">
            <h3 className="text-subheading font-semibold text-text mb-2">
              💡 궁합 개선 전략
            </h3>
            <p className="text-small text-primary mb-4">
              ⭐ 이 관계를 살리는 구체적인 방법
            </p>

            {/* 핵심 한마디 */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-pink-100 rounded-xl mb-4 text-center">
              <p className="text-lg font-bold text-primary">
                &ldquo;{interpretation.improvement.keyAdvice}&rdquo;
              </p>
            </div>

            {/* 서로 바꿔야 할 점 */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="p-4 bg-white rounded-xl border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-600 mb-2">
                  🔧 {name1}님이 바꾸면 좋은 점
                </h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.improvement.changePoints.person1}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border-l-4 border-pink-400">
                <h4 className="font-semibold text-pink-600 mb-2">
                  🔧 {name2}님이 바꾸면 좋은 점
                </h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.improvement.changePoints.person2}
                </p>
              </div>
            </div>

            {/* 역할 분담 & 소통 규칙 */}
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-violet-600 mb-2">📋 역할 분담 제안</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.improvement.roleDivision}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h4 className="font-semibold text-teal-600 mb-2">💬 의사소통 규칙</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.improvement.communicationRules}
                </p>
              </div>
            </div>
          </Card>

          {/* 결혼 & 미래 가능성 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              💍 결혼 & 미래 가능성
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <h4 className="font-semibold text-pink-600 mb-2">💒 결혼 전망</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.future.marriageProspect}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl">
                <h4 className="font-semibold text-green-600 mb-2">✨ 재물운/자녀운 시너지</h4>
                <p className="text-body text-text-muted leading-relaxed">
                  {interpretation.future.synergy}
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

// 해석 없거나 구 버전 형식일 때 기본 콘텐츠
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
          dayMaster1={result1.dayMaster}
          dayMaster2={result2.dayMaster}
          dayMasterKorean1={result1.dayMasterKorean}
          dayMasterKorean2={result2.dayMasterKorean}
        />
      </Card>

      <Card>
        <p className="text-small text-text-muted text-center">
          더 자세한 궁합 분석을 보시려면 다시 분석해주세요.
        </p>
      </Card>
    </div>
  )
}
