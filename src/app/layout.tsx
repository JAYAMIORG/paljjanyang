import type { Metadata, Viewport } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import './globals.css'

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '팔자냥 - 나만의 사주 이야기',
  description: 'MZ세대를 위한 프리미엄 사주 서비스. 개인 사주, 신년운세, 궁합, 연애운을 확인해보세요.',
  keywords: ['사주', '운세', '궁합', '신년운세', '연애운', 'MZ', '팔자냥'],
  authors: [{ name: '팔자냥' }],
  openGraph: {
    title: '팔자냥 - 나만의 사주 이야기',
    description: 'MZ세대를 위한 프리미엄 사주 서비스',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: 'https://bazi-azure.vercel.app/images/animals/test.png',
        width: 400,
        height: 400,
        alt: '팔자냥',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: '팔자냥 - 나만의 사주 이야기',
    description: 'MZ세대를 위한 프리미엄 사주 서비스',
    images: ['https://bazi-azure.vercel.app/images/animals/test.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6B5B95',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <head>
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
