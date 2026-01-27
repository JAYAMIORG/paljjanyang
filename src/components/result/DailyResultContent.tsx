'use client'

import { Card } from '@/components/ui'
import type { SajuResult } from '@/types/saju'
import type { DailyInterpretation } from '@/types/interpretation'

interface DailyResultContentProps {
  result: SajuResult
  interpretation: DailyInterpretation | null
  isNew: boolean
}

const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

// 방향 아이콘
const DIRECTION_EMOJI: Record<string, string> = {
  '동': '🌅',
  '서': '🌇',
  '남': '🌞',
  '북': '❄️',
  '동북': '🏔️',
  '동남': '🌴',
  '서북': '🌙',
  '서남': '🏜️',
}

// 점수를 별로 표시
function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-lg ${i <= score ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// 카테고리 아이콘
const CATEGORY_ICONS: Record<string, string> = {
  wealth: '💰',
  love: '💕',
  health: '💪',
  work: '💼',
}

const CATEGORY_KOREAN: Record<string, string> = {
  wealth: '재물운',
  love: '연애운',
  health: '건강운',
  work: '업무운',
}

export function DailyResultContent({ result, interpretation, isNew }: DailyResultContentProps) {
  const emoji = DAY_MASTER_EMOJI[result.dayMaster] || '🐱'
  const today = new Date()
  const dateString = `${today.getMonth() + 1}월 ${today.getDate()}일`

  return (
    <div className="space-y-4">
      {/* 오늘의 운세 헤더 */}
      <Card variant="highlighted">
        <div className="text-center">
          <span className="text-5xl mb-3 block">{emoji}</span>
          <h2 className="text-heading font-semibold text-text mb-1">
            {dateString} 오늘의 운세
          </h2>
          <p className="text-small text-text-muted">
            {result.dayMasterKorean}의 오늘
          </p>
          {!isNew && (
            <p className="text-xs text-primary mt-2">
              오늘 이미 확인한 운세예요
            </p>
          )}
        </div>
      </Card>

      {/* 운세 내용 */}
      {interpretation ? (
        <>
          {/* 오늘의 에너지 & 총운 */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-subheading font-semibold text-text">
                🔮 오늘의 총운
              </h3>
              {interpretation.energy && (
                <ScoreStars score={interpretation.energy.score} />
              )}
            </div>
            <p className="text-body text-text leading-relaxed mb-3">
              {interpretation.overview}
            </p>
            {interpretation.energy?.keywords && interpretation.energy.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interpretation.energy.keywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-small">
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* 분야별 운세 */}
          {interpretation.categories && (
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-3">
                📊 분야별 운세
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(interpretation.categories) as [keyof typeof interpretation.categories, string][]).map(([key, content]) => (
                  <div
                    key={key}
                    className="p-3 bg-background-secondary rounded-xl"
                  >
                    <h4 className="font-semibold text-text mb-1 flex items-center gap-1 text-small">
                      <span>{CATEGORY_ICONS[key]}</span>
                      {CATEGORY_KOREAN[key]}
                    </h4>
                    <p className="text-small text-text-muted leading-relaxed">
                      {content}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 시간대별 운세 */}
          {interpretation.timing && (
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-3">
                ⏰ 시간대별 운세
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-1 text-small">좋은 시간대</h4>
                  <p className="text-small text-text-muted">{interpretation.timing.goodTime}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-600 mb-1 text-small">주의할 시간대</h4>
                  <p className="text-small text-text-muted">{interpretation.timing.cautionTime}</p>
                </div>
              </div>
            </Card>
          )}

          {/* 행운 키워드 */}
          {interpretation.lucky && (
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-3">
                🍀 오늘의 행운
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {interpretation.lucky.color && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <span className="text-xl">🎨</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 색상</p>
                      <p className="font-semibold text-text">{interpretation.lucky.color}</p>
                    </div>
                  </div>
                )}
                {interpretation.lucky.number && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <span className="text-xl">🔢</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 숫자</p>
                      <p className="font-semibold text-text">{interpretation.lucky.number}</p>
                    </div>
                  </div>
                )}
                {interpretation.lucky.direction && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <span className="text-xl">{DIRECTION_EMOJI[interpretation.lucky.direction] || '🧭'}</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 방향</p>
                      <p className="font-semibold text-text">{interpretation.lucky.direction}</p>
                    </div>
                  </div>
                )}
                {interpretation.lucky.food && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <span className="text-xl">🍽️</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 음식</p>
                      <p className="font-semibold text-text">{interpretation.lucky.food}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 오늘의 조언 */}
          {interpretation.advice && (
            <Card variant="highlighted">
              <h3 className="text-subheading font-semibold text-text mb-3">
                💡 오늘의 조언
              </h3>
              <div className="space-y-4">
                {interpretation.advice.dos && interpretation.advice.dos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 text-small">✓ 하면 좋은 것</h4>
                    <ul className="space-y-1">
                      {interpretation.advice.dos.map((item, i) => (
                        <li key={i} className="text-body text-text-muted flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {interpretation.advice.donts && interpretation.advice.donts.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-500 mb-2 text-small">✗ 피하면 좋은 것</h4>
                    <ul className="space-y-1">
                      {interpretation.advice.donts.map((item, i) => (
                        <li key={i} className="text-body text-text-muted flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      ) : (
        /* 해석 없을 때 기본 콘텐츠 */
        <Card>
          <div className="text-body text-text leading-relaxed">
            <p>오늘은 {result.dominantElement}의 기운이 강한 하루예요.</p>
            <p className="mt-2">차분하게 하루를 시작하면 좋은 일이 생길 거예요.</p>
          </div>
        </Card>
      )}

      {/* 안내 메시지 */}
      <div className="text-center text-small text-text-muted py-2">
        오늘의 운세는 하루에 한 번만 무료로 볼 수 있어요
      </div>
    </div>
  )
}
