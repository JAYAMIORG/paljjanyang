'use client'

import { Card } from '@/components/ui'
import { getPersonalityByElement } from '@/lib/saju/constants'

interface FallbackData {
  dayMasterKorean: string
  dominantElement: string
  weakElement?: string
}

interface FallbackInterpretationProps {
  data: FallbackData
  /** true인 경우 공유 페이지용 간략 버전 표시 */
  isShared?: boolean
}

/**
 * LLM 해석 실패 시 사용하는 폴백 해석 컴포넌트
 */
export function FallbackInterpretation({ data, isShared = false }: FallbackInterpretationProps) {
  if (isShared) {
    // 공유 페이지용 간략 버전
    return (
      <div className="space-y-4">
        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            핵심 요약
          </h3>
          <p className="text-body text-text-muted leading-relaxed">
            <span className="font-semibold text-primary">{data.dayMasterKorean}</span>의
            성향을 가진 사주입니다. {data.dominantElement}이 강하여
            추진력과 에너지가 넘치는 특징이 있습니다.
          </p>
        </Card>

        <Card>
          <h3 className="text-subheading font-semibold text-text mb-3">
            성격과 기질
          </h3>
          <p className="text-body text-text-muted leading-relaxed">
            {data.dayMasterKorean}의 성향을 가진 사람은 {getPersonalityByElement(data.dominantElement)}.
            목표를 향해 꾸준히 나아가는 성격이며, 주변 사람들에게 신뢰를 주는 편입니다.
          </p>
        </Card>
      </div>
    )
  }

  // 결과 페이지용 전체 버전
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          핵심 요약
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          당신은 <span className="font-semibold text-primary">{data.dayMasterKorean}</span>의
          성향을 가진 사람입니다. {data.dominantElement}이 강하여
          추진력과 에너지가 넘칩니다. {data.weakElement && (
            <>반면 {data.weakElement}이 부족하니 이 부분을 보완하면 더욱 균형 잡힌 삶을 살 수 있습니다.</>
          )}
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          성격과 기질
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          {data.dayMasterKorean}의 성향을 가진 당신은 {getPersonalityByElement(data.dominantElement)}.
          목표를 향해 꾸준히 나아가는 성격이며, 주변 사람들에게 신뢰를 주는 편입니다.
        </p>
      </Card>

      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          올해의 운세
        </h3>
        <p className="text-body text-text-muted leading-relaxed">
          올해는 전반적으로 안정적인 흐름입니다.
          상반기에는 준비와 계획에 집중하고, 하반기에는 실행에 옮기면 좋은 결과를 얻을 수 있어요.
          특히 {data.dominantElement}의 기운을 잘 활용하면 좋은 기회가 찾아올 거예요.
        </p>
      </Card>
    </div>
  )
}
