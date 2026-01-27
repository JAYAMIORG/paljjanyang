import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스 이용약관',
  description: '팔자냥 서비스 이용약관입니다.',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
