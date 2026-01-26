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
          {/* 총운 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              🔮 오늘의 총운
            </h3>
            <p className="text-body text-text leading-relaxed">
              {interpretation.overview}
            </p>
          </Card>

          {/* 행운 키워드 */}
          {(interpretation.lucky.color || interpretation.lucky.number || interpretation.lucky.direction) && (
            <Card>
              <h3 className="text-subheading font-semibold text-text mb-3">
                🍀 오늘의 행운
              </h3>
              <div className="flex flex-wrap gap-3">
                {interpretation.lucky.color && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <span className="text-lg">🎨</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 색상</p>
                      <p className="font-semibold text-primary">{interpretation.lucky.color}</p>
                    </div>
                  </div>
                )}
                {interpretation.lucky.number && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <span className="text-lg">🔢</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 숫자</p>
                      <p className="font-semibold text-primary">{interpretation.lucky.number}</p>
                    </div>
                  </div>
                )}
                {interpretation.lucky.direction && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <span className="text-lg">{DIRECTION_EMOJI[interpretation.lucky.direction] || '🧭'}</span>
                    <div>
                      <p className="text-xs text-text-muted">행운의 방향</p>
                      <p className="font-semibold text-primary">{interpretation.lucky.direction}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 오늘의 조언 */}
          <Card variant="highlighted">
            <h3 className="text-subheading font-semibold text-text mb-3">
              💡 오늘의 조언
            </h3>
            <p className="text-body text-text leading-relaxed">
              {interpretation.advice}
            </p>
          </Card>
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
