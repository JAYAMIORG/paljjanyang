import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '코인 충전',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
