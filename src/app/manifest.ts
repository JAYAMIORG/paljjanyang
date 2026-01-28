import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '팔자냥 - 나만의 사주 이야기',
    short_name: '팔자냥',
    description: '880원으로 보는 프리미엄 사주 서비스. 개인 사주, 신년운세, 궁합, 연애운을 상세하게 풀이해드립니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9F7F4',
    theme_color: '#6a3ae7',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/images/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['lifestyle', 'entertainment'],
    lang: 'ko',
  }
}
