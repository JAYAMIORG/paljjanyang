import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '환불 정책',
  description: '팔자냥 환불 정책입니다.',
  alternates: {
    canonical: '/refund',
  },
}

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
