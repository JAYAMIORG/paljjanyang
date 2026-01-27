'use client'

import { Card, WuXingRadarChart } from '@/components/ui'
import type { SajuResult } from '@/types/saju'
import type { YearlyInterpretation } from '@/types/interpretation'

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
  wealth: '💰',
  love: '💕',
  career: '💼',
  health: '💪',
}

const CATEGORY_KOREAN: Record<string, string> = {
  wealth: '재물운',
  love: '연애운',
  career: '직장운',
  health: '건강운',
}

interface YearlyResultContentProps {
  result: SajuResult
  interpretation: YearlyInterpretation | null
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

        {/* 오행 레이더 차트 */}
        <div className="mt-6 flex flex-col items-center">
          <WuXingRadarChart wuXing={result.wuXing} size={180} />
          <p className="text-center text-caption text-text-muted mt-2">
            <span className="text-primary font-medium">강:</span> {result.dominantElement} · <span className="text-accent-rose font-medium">약:</span> {result.weakElement}
          </p>
        </div>
      </Card>

      {interpretation ? (
        <>
          {/* 핵심 요약 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              🎯 {currentYear}년 핵심 요약
            </h3>
            <p className="text-lg font-medium text-primary mb-2">
              "{interpretation.summary.oneLine}"
            </p>
            <div className="flex flex-wrap gap-2">
              {interpretation.summary.keywords.map((keyword, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-small">
                  #{keyword}
                </span>
              ))}
            </div>
          </Card>

          {/* 총운 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              📅 {currentYear}년 총운
            </h3>
            <p className="text-body text-text-muted leading-relaxed mb-4">
              {interpretation.overview.general}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-1">상반기</h4>
                <p className="text-small text-text-muted">{interpretation.overview.firstHalf}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-1">하반기</h4>
                <p className="text-small text-text-muted">{interpretation.overview.secondHalf}</p>
              </div>
            </div>
          </Card>

          {/* 월별 운세 */}
          {interpretation.monthly.length > 0 && (
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-4">
                📆 월별 운세
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interpretation.monthly.map((fortune) => (
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
                    <p className="text-small text-text-muted">
                      {fortune.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 행운의 달 & 주의할 달 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interpretation.highlights.luckyMonths.length > 0 && (
              <Card>
                <h3 className="text-subheading font-semibold text-green-600 mb-3">
                  🍀 행운의 달
                </h3>
                <div className="space-y-2">
                  {interpretation.highlights.luckyMonths.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-bold text-green-600">{m.month}월</span>
                      <span className="text-body text-text-muted">{m.reason}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {interpretation.highlights.cautionMonths.length > 0 && (
              <Card>
                <h3 className="text-subheading font-semibold text-orange-500 mb-3">
                  ⚠️ 주의할 달
                </h3>
                <div className="space-y-2">
                  {interpretation.highlights.cautionMonths.map((m, i) => (
                    <div key={i} className="p-2 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-orange-600">{m.month}월</span>
                        <span className="text-small text-text-muted">{m.caution}</span>
                      </div>
                      <p className="text-small text-primary">💡 {m.solution}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* 카테고리별 운세 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-4">
              🔮 분야별 운세
            </h3>
            <div className="space-y-4">
              {(Object.entries(interpretation.categories) as [keyof typeof interpretation.categories, string][]).map(([key, content]) => (
                <div
                  key={key}
                  className="p-4 bg-background-secondary rounded-xl"
                >
                  <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                    <span>{CATEGORY_ICONS[key] || '✨'}</span>
                    {CATEGORY_KOREAN[key]}
                  </h4>
                  <p className="text-body text-text-muted leading-relaxed">
                    {content}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* 실천 조언 */}
          {interpretation.actionItems.length > 0 && (
            <Card variant="highlighted">
              <h3 className="text-subheading font-semibold text-text mb-3">
                💡 올해의 실천 조언
              </h3>
              <ul className="space-y-2">
                {interpretation.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    <span className="text-body text-text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      ) : (
        /* 해석 없을 때 기본 콘텐츠 */
        <YearlyDefaultContent result={result} />
      )}
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
