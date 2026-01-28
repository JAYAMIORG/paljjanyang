import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사주 분석 결과',
  description: '팔자냥에서 분석한 나만의 사주 결과를 확인해보세요.',
  openGraph: {
    title: '팔자냥 - 나의 사주 분석 결과',
    description: '팔자냥에서 분석한 나만의 사주 결과를 확인해보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '팔자냥',
    // images는 opengraph-image.tsx에서 동적으로 생성됨
  },
  twitter: {
    card: 'summary_large_image',
    title: '팔자냥 - 나의 사주 분석 결과',
    description: '팔자냥에서 분석한 나만의 사주 결과를 확인해보세요.',
    // images는 opengraph-image.tsx에서 동적으로 생성됨
  },
}

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
