import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = '팔자냥 사주 결과'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // 단순 테스트: 정적 폴백 이미지만 반환
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#6B5B95',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 48,
        }}
      >
        팔자냥
      </div>
    ),
    {
      ...size,
    }
  )
}
