'use client'

import { Card } from '@/components/ui'
import type { PersonalInterpretation } from '@/types/interpretation'

interface PersonalResultContentProps {
  interpretation: PersonalInterpretation | null
}

export function PersonalResultContent({ interpretation }: PersonalResultContentProps) {
  // interpretation이 null이면 빈 컨텐츠 반환
  if (!interpretation) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* 2. 오행 분석 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          오행 분석
        </h3>
        <div className="space-y-4 text-body text-text-muted leading-relaxed">
          <p>{interpretation.wuXingAnalysis.balanceAnalysis}</p>

          <div className="bg-primary/5 rounded-lg p-3">
            <h4 className="font-semibold text-text mb-2">강한 오행</h4>
            <p className="mb-2"><strong>성격:</strong> {interpretation.wuXingAnalysis.strongElement.traits}</p>
            <p className="mb-2"><strong>장점:</strong> {interpretation.wuXingAnalysis.strongElement.advantages}</p>
            <p className="mb-2"><strong>주의점:</strong> {interpretation.wuXingAnalysis.strongElement.cautions}</p>
            <p><strong>스트레스 해소:</strong> {interpretation.wuXingAnalysis.strongElement.stressRelief}</p>
          </div>

          <div className="bg-accent-rose/5 rounded-lg p-3">
            <h4 className="font-semibold text-text mb-2">약한 오행 (인생 과제)</h4>
            <p className="mb-2"><strong>어려움:</strong> {interpretation.wuXingAnalysis.weakElement.challenges}</p>
            <p><strong>보완 방법:</strong> {interpretation.wuXingAnalysis.weakElement.supplements}</p>
          </div>
        </div>
      </Card>

      {/* 3. 타고난 성격 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          타고난 성격과 기질
        </h3>
        <div className="space-y-3 text-body text-text-muted leading-relaxed">
          <p>{interpretation.personality.core}</p>

          <div>
            <h4 className="font-semibold text-primary mb-1">강점</h4>
            <ul className="list-disc list-inside space-y-1">
              {interpretation.personality.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-accent-rose mb-1">주의할 점</h4>
            <ul className="list-disc list-inside space-y-1">
              {interpretation.personality.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-text mb-1">겉과 속의 차이</h4>
            <p>{interpretation.personality.innerSelf}</p>
          </div>
        </div>
      </Card>

      {/* 4. 대인관계 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          대인관계
        </h3>
        <div className="space-y-3 text-body text-text-muted leading-relaxed">
          <p><strong>관계 스타일:</strong> {interpretation.relationships.style}</p>
          <p><strong>잘 맞는 유형:</strong> {interpretation.relationships.compatible}</p>
          <p><strong>안 맞는 유형:</strong> {interpretation.relationships.incompatible}</p>
          <div className="bg-primary/5 rounded-lg p-3 mt-2">
            <p className="text-text">{interpretation.relationships.advice}</p>
          </div>
        </div>
      </Card>

      {/* 5. 적성과 직업 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          적성과 직업
        </h3>
        <div className="space-y-3 text-body text-text-muted leading-relaxed">
          <div>
            <h4 className="font-semibold text-text mb-1">어울리는 분야</h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.career.fields.map((f, i) => (
                <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-small">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-1">추천 직업</h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.career.jobs.map((j, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-small">
                  {j}
                </span>
              ))}
            </div>
          </div>

          <p><strong>적성 유형:</strong> {interpretation.career.aptitudeType}</p>
          <p><strong>일하는 스타일:</strong> {interpretation.career.workStyle}</p>

          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-text">{interpretation.career.advice}</p>
          </div>
        </div>
      </Card>

      {/* 6. 재물운 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          성공운, 재물운
        </h3>
        <div className="space-y-3 text-body text-text-muted leading-relaxed">
          <p><strong>돈 버는 스타일:</strong> {interpretation.wealth.earningStyle}</p>
          <p><strong>맞는 재테크:</strong> {interpretation.wealth.investmentStyle}</p>
          <p><strong>재물운 좋은 시기:</strong> <span className="text-primary font-semibold">{interpretation.wealth.peakPeriod}</span></p>

          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-text">{interpretation.wealth.advice}</p>
          </div>
        </div>
      </Card>

      {/* 7. 대운이 들어오는 시기 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          대운이 들어오는 시기
        </h3>
        <div className="space-y-2">
          {interpretation.luckyPeriods.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
              <span className="text-primary font-bold whitespace-nowrap">{p.period}</span>
              <span className="text-body text-text-muted">{p.opportunity}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 8. 조심해야 할 시기 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          조심해야 할 시기
        </h3>
        <div className="space-y-2">
          {interpretation.cautionPeriods.map((p, i) => (
            <div key={i} className="p-3 bg-accent-rose/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-accent-rose font-bold">{p.period}</span>
              </div>
              <p className="text-body text-text-muted mb-1">{p.caution}</p>
              <p className="text-small text-primary">💡 {p.solution}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 9. 연애, 결혼운 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          연애, 결혼운
        </h3>
        <div className="space-y-3 text-body text-text-muted leading-relaxed">
          <p><strong>연애 스타일:</strong> {interpretation.love.style}</p>
          <p><strong>이상형:</strong> {interpretation.love.idealType}</p>
          <p><strong>결혼 좋은 시기:</strong> <span className="text-primary font-semibold">{interpretation.love.marriageTiming}</span></p>

          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-text">{interpretation.love.advice}</p>
          </div>
        </div>
      </Card>

      {/* 10. 건강운 */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          건강운
        </h3>
        <div className="space-y-3 text-body text-text-muted leading-relaxed">
          <div className="bg-accent-rose/5 rounded-lg p-3">
            <h4 className="font-semibold text-accent-rose mb-1">약한 부분</h4>
            <p>{interpretation.health.weakPoints}</p>
          </div>

          <div className="bg-primary/5 rounded-lg p-3">
            <h4 className="font-semibold text-primary mb-1">강한 부분</h4>
            <p>{interpretation.health.strongPoints}</p>
          </div>

          <p>{interpretation.health.advice}</p>
        </div>
      </Card>

      {/* 11. MBTI */}
      <Card>
        <h3 className="text-subheading font-semibold text-text mb-3">
          이 사주와 어울리는 MBTI
        </h3>
        <div className="space-y-3 text-body text-text-muted">
          <div>
            <h4 className="font-semibold text-text mb-1">이 사주에 많은 MBTI</h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.mbti.likely.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-primary text-white rounded-full font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-1">잘 맞는 MBTI</h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.mbti.compatible.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-full font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-1">안 맞는 MBTI</h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.mbti.incompatible.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
