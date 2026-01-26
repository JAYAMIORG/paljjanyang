'use client'

import { Card } from '@/components/ui'
import type { SajuResult } from '@/types/saju'
import type { LoveInterpretation } from '@/types/interpretation'

interface LoveResultContentProps {
  result: SajuResult
  interpretation: LoveInterpretation | null
}

const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

export function LoveResultContent({ result, interpretation }: LoveResultContentProps) {
  const emoji = DAY_MASTER_EMOJI[result.dayMaster] || '🐱'
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <Card variant="highlighted">
        <div className="text-center">
          <span className="text-5xl mb-3 block">{emoji}</span>
          <h2 className="text-heading font-semibold text-text mb-2">
            {result.dayMasterKorean}의 연애운
          </h2>
          <p className="text-body text-text-muted">
            {result.koreanGanji}
          </p>
        </div>
      </Card>

      {interpretation ? (
        <>
          {/* 연애 스타일 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              💕 나의 연애 스타일
            </h3>
            <div className="space-y-3 text-body text-text-muted leading-relaxed">
              <div className="p-3 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-600 mb-1">사랑에 빠지는 패턴</h4>
                <p>{interpretation.style.pattern}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-600 mb-1">연애할 때의 모습</h4>
                <p>{interpretation.style.behavior}</p>
              </div>
            </div>
          </Card>

          {/* 잘 맞는 상대 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              💑 잘 맞는 상대
            </h3>
            <div className="space-y-3 text-body text-text-muted leading-relaxed">
              <p><strong className="text-primary">사주적으로 좋은 특성:</strong> {interpretation.idealPartner.traits}</p>
              <p><strong className="text-primary">함께 편한 유형:</strong> {interpretation.idealPartner.comfortable}</p>
            </div>
          </Card>

          {/* 주의할 점 */}
          <Card>
            <h3 className="text-subheading font-semibold text-orange-500 mb-3">
              ⚠️ 연애에서 주의할 점
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-1">반복되는 패턴</h4>
                <p className="text-body text-text-muted">{interpretation.cautions.patterns}</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-primary mb-1">의식하면 좋은 부분</h4>
                <p className="text-body text-text-muted">{interpretation.cautions.awareness}</p>
              </div>
            </div>
          </Card>

          {/* 올해 연애운 */}
          <Card>
            <h3 className="text-subheading font-semibold text-text mb-3">
              📅 {currentYear}년 연애운
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-600 mb-1">인연이 올 시기</h4>
                <p className="text-body text-text-muted">{interpretation.yearlyOutlook.meetingPeriod}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-1">관계 발전 포인트</h4>
                <p className="text-body text-text-muted">{interpretation.yearlyOutlook.developmentTips}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-600 mb-1">주의할 시기</h4>
                <p className="text-body text-text-muted">{interpretation.yearlyOutlook.cautionPeriod}</p>
              </div>
            </div>
          </Card>

          {/* 좋은 인연 만나는 팁 */}
          <Card variant="highlighted">
            <h3 className="text-subheading font-semibold text-text mb-3">
              💡 좋은 인연 만나는 팁
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text mb-2">인연이 올 장소/상황</h4>
                <div className="flex flex-wrap gap-2">
                  {interpretation.meetingTips.places.map((place, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-small">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-text mb-2">좋은 타이밍</h4>
                <p className="text-body text-text-muted">{interpretation.meetingTips.timing}</p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        /* 해석 없을 때 기본 콘텐츠 */
        <LoveDefaultContent result={result} />
      )}
    </div>
  )
}

// LLM 해석 없을 때 기본 콘텐츠
function LoveDefaultContent({ result }: { result: SajuResult }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💕 연애 스타일
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {result.dayMasterKorean}의 성향을 가진 당신은
          연애에서도 이러한 특성이 나타납니다.
          {result.dominantElement}이 강하여 적극적인 면이 있어요.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💑 이상형
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          당신의 {result.weakElement}을 보완해 줄 수 있는 상대와
          좋은 궁합을 이룰 수 있어요.
          서로의 부족한 부분을 채워주는 관계가 이상적입니다.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          💡 조언
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          연애운은 노력과 타이밍의 조화가 중요합니다.
          자신을 사랑하고 가꾸면서 좋은 인연을 기다려보세요.
        </p>
      </Card>
    </div>
  )
}
