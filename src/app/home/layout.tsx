import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사주 유형 선택 - 개인사주 · 신년운세 · 궁합 · 연애운',
  description: '개인 사주, 2026 신년운세, 궁합, 연애운 중 원하는 사주 유형을 선택하세요. 만세력 기반 정통 사주팔자를 AI가 분석해드립니다.',
  alternates: {
    canonical: '/home',
  },
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
