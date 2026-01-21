'use client'

import { Card } from '@/components/ui'
import type { SajuResult } from '@/types/saju'

interface DailyResultContentProps {
  result: SajuResult
  interpretation: string | null
  isNew: boolean
}

const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
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
        <Card>
          <div className="text-body text-text leading-relaxed whitespace-pre-wrap">
            {parseSimpleContent(interpretation)}
          </div>
        </Card>
      ) : (
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

// 마크다운 헤더 제거하고 단순 텍스트로 변환
function parseSimpleContent(markdown: string): string {
  return markdown
    .replace(/^#{1,3}\s+.+$/gm, '') // 헤더 제거
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 볼드 제거
    .replace(/\*([^*]+)\*/g, '$1') // 이탤릭 제거
    .replace(/^[-*]\s+/gm, '• ') // 리스트 마커 변환
    .trim()
}
