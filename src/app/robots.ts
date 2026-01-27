import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://palzza.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/home', '/terms', '/privacy', '/refund', '/saju/shared/'],
        disallow: [
          '/api/',
          '/auth/',
          '/mypage',
          '/coin',
          '/payment/',
          '/saju/result',
          '/saju/preview',
          '/saju/personal',
          '/saju/yearly',
          '/saju/compatibility',
          '/saju/love',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
