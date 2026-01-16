'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { useAuth } from '@/hooks'

const sajuTypes = [
  {
    id: 'personal',
    title: '개인 사주',
    description: '사주팔자 + 인생 전체 분석',
    icon: '🔮',
    features: ['성격 기질', '천부 재능', '대운 흐름'],
  },
  {
    id: 'yearly',
    title: '신년운세',
    description: '2025년 월별 운세 총정리',
    icon: '📅',
    features: ['월별 운세', '행운의 날', '주의할 날'],
  },
  {
    id: 'compatibility',
    title: '궁합',
    description: '두 사람의 사주 궁합 분석',
    icon: '💕',
    features: ['종합 궁합', '성격 궁합', '인연 분석'],
  },
  {
    id: 'love',
    title: '연애운',
    description: '연애/결혼 관련 운세',
    icon: '💝',
    features: ['이상형 분석', '연애 시기', '결혼운'],
  },
]

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleSajuClick = (typeId: string) => {
    if (loading) return

    if (!user) {
      // 로그인 안됨 → 로그인 페이지로 이동 (redirect 파라미터 포함)
      router.push(`/auth/login?redirect=/saju/${typeId}`)
    } else {
      // 로그인됨 → 사주 입력 페이지로 이동
      router.push(`/saju/${typeId}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <h2 className="text-heading text-text mb-2">
            어떤 운세가 궁금하세요?
          </h2>
          <p className="text-body text-text-muted">
            원하는 사주 유형을 선택하세요
          </p>
        </section>

        {/* Saju Type Cards */}
        <section className="flex flex-col gap-3">
          {sajuTypes.map((type) => (
            <SajuTypeCard
              key={type.id}
              {...type}
              onClick={() => handleSajuClick(type.id)}
            />
          ))}
        </section>
      </main>
    </div>
  )
}

function SajuTypeCard({
  title,
  description,
  icon,
  features,
  onClick,
}: {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="block w-full text-left">
      <Card className="hover:shadow-card-hover hover:border-primary-light cursor-pointer">
        <div className="flex gap-4">
          <span className="text-4xl flex-shrink-0">{icon}</span>
          <div className="flex-1">
            <h3 className="text-subheading font-semibold text-text mb-1">{title}</h3>
            <p className="text-small text-text-muted mb-3">{description}</p>
            <ul className="flex flex-wrap gap-1.5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="text-[11px] text-text-light bg-gray-100 px-2 py-0.5 rounded"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </button>
  )
}
