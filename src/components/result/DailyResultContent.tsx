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

// 점수에 따른 배터리/날씨 아이콘
function getScoreDisplay(score: number) {
  if (score >= 80) return { icon: '☀️', label: '맑음', color: 'text-yellow-500' }
  if (score >= 60) return { icon: '🌤️', label: '구름조금', color: 'text-blue-400' }
  if (score >= 40) return { icon: '☁️', label: '흐림', color: 'text-gray-500' }
  if (score >= 20) return { icon: '🌧️', label: '비', color: 'text-blue-600' }
  return { icon: '⚡', label: '폭풍', color: 'text-purple-600' }
}

// 점수 바 컴포넌트
function ScoreBar({ score }: { score: number }) {
  const display = getScoreDisplay(score)
  const barColor = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-3">
      <span className={`text-3xl ${display.color}`}>{display.icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-text-muted">{display.label}</span>
          <span className="text-lg font-bold text-text">{score}점</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  )
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
          {/* 3초 요약 (The Hook) */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              ⚡ 3초 요약
            </h3>

            {/* 한 줄 코멘트 */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent-rose/10 rounded-xl mb-4">
              <p className="text-lg font-bold text-text text-center leading-relaxed">
                "{interpretation.hook.oneLiner}"
              </p>
            </div>

            {/* 오늘의 총점 */}
            <div className="mb-4">
              <ScoreBar score={interpretation.hook.score} />
            </div>

            {/* 핵심 키워드 */}
            <div className="flex flex-wrap gap-2 justify-center">
              {interpretation.hook.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-small font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          {/* 액션 & 개운 아이템 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              🍀 오늘의 행운 아이템
            </h3>
            <div className="space-y-3">
              {/* 행운의 컬러 */}
              <div className="p-3 bg-background-secondary rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎨</span>
                  <span className="font-semibold text-text">행운의 컬러</span>
                  <span className="ml-auto font-bold text-primary">{interpretation.luckyItems.color.name}</span>
                </div>
                <p className="text-small text-text-muted pl-7">
                  {interpretation.luckyItems.color.tip}
                </p>
              </div>

              {/* 행운의 푸드 */}
              <div className="p-3 bg-background-secondary rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🍔</span>
                  <span className="font-semibold text-text">오늘의 점심</span>
                  <span className="ml-auto font-bold text-primary">{interpretation.luckyItems.food.name}</span>
                </div>
                <p className="text-small text-text-muted pl-7">
                  {interpretation.luckyItems.food.reason}
                </p>
              </div>

              {/* 행운의 방향 & 숫자 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background-secondary rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{DIRECTION_EMOJI[interpretation.luckyItems.direction.name] || '🧭'}</span>
                    <span className="font-semibold text-text text-small">행운의 방향</span>
                  </div>
                  <p className="font-bold text-primary text-lg">{interpretation.luckyItems.direction.name}쪽</p>
                  <p className="text-xs text-text-muted mt-1">{interpretation.luckyItems.direction.tip}</p>
                </div>
                <div className="p-3 bg-background-secondary rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔢</span>
                    <span className="font-semibold text-text text-small">행운의 숫자</span>
                  </div>
                  <p className="font-bold text-primary text-3xl">{interpretation.luckyItems.number}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 재미 & 경고 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              👀 오늘의 인물
            </h3>
            <div className="space-y-3">
              {/* 오늘의 빌런 */}
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">😈</span>
                  <span className="font-semibold text-red-600">오늘의 빌런</span>
                </div>
                <p className="text-body text-text-muted">
                  {interpretation.people.villain}
                </p>
              </div>

              {/* 오늘의 귀인 */}
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">😇</span>
                  <span className="font-semibold text-green-600">오늘의 귀인</span>
                </div>
                <p className="text-body text-text-muted">
                  {interpretation.people.helper}
                </p>
              </div>
            </div>
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
