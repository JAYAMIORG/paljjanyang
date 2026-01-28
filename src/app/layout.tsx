import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { JsonLd } from '@/components/seo/JsonLd'

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://palzza.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '팔자냥 - 880원 사주 · 신년운세 · 궁합 · 연애운',
    template: '%s | 팔자냥',
  },
  description: '880원으로 보는 프리미엄 사주 서비스. 만세력 기반 정통 사주팔자, 2026 신년운세, 궁합, 연애운을 AI가 상세하게 분석해드립니다. 40년 경력 역술가의 노하우를 담았습니다.',
  keywords: [
    // 핵심 키워드
    '사주', '운세', '궁합', '신년운세', '연애운', '무료운세', '무료사주',
    // 2026년 키워드
    '2026 신년운세', '2026 운세', '2026 사주', '병오년 운세',
    // 세부 키워드
    '사주팔자', '오행', '대운', '세운', '월운', '토정비결', '명리학',
    // 운세 종류
    '오늘의 운세', '평생운세', '재물운', '취업운', '결혼운', '건강운',
    // 브랜드
    '팔자냥', 'MZ운세', '저렴한사주',
  ],
  authors: [{ name: '팔자냥' }, { name: 'ChartIQ' }],
  creator: 'ChartIQ',
  publisher: 'ChartIQ',
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '팔자냥 - 880원 사주 · 신년운세 · 궁합',
    description: '880원으로 보는 프리미엄 사주 서비스. 만세력 기반 정통 사주팔자, 2026 신년운세, 궁합, 연애운 분석.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '팔자냥',
    url: baseUrl,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: '팔자냥 - 나만의 사주 이야기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '팔자냥 - 880원 사주 · 신년운세 · 궁합',
    description: '880원으로 보는 프리미엄 사주 서비스. 만세력 기반 정통 사주팔자, 2026 신년운세, 궁합, 연애운 분석.',
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  category: 'lifestyle',
  verification: {
    google: 'ff0UtorPHNWYMKLGVAX7knKfowbmpJC0cilStH_ts7E',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6a3ae7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <head>
        {/* JSON-LD 구조화된 데이터 */}
        <JsonLd />
        {/* Font CDN Preconnect */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        {/* GanaChocolate Font Preload */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ghanachoco.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        {/* Pretendard Font CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto max-w-[500px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
