import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = '팔자냥 - 나만의 사주 이야기'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bazi-azure.vercel.app'

  // 이미지 가져오기
  let bgImageData: ArrayBuffer | null = null
  let logoImageData: ArrayBuffer | null = null

  try {
    const [bgResponse, logoResponse] = await Promise.all([
      fetch(`${productionUrl}/images/main-bg-4.png`),
      fetch(`${productionUrl}/images/logo-opened.png`),
    ])

    if (bgResponse.ok) {
      bgImageData = await bgResponse.arrayBuffer()
    }
    if (logoResponse.ok) {
      logoImageData = await logoResponse.arrayBuffer()
    }
  } catch (e) {
    console.error('Failed to fetch images:', e)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 배경 이미지 */}
        {bgImageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${Buffer.from(bgImageData).toString('base64')}`}
            alt=""
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
            }}
          />
        )}

        {/* 로고 이미지 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {logoImageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${Buffer.from(logoImageData).toString('base64')}`}
              alt=""
              style={{
                width: '600px',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: '#D4A574',
              }}
            >
              팔자냥
            </div>
          )}

          {/* 서브 텍스트 */}
          <p
            style={{
              fontSize: '32px',
              color: '#4B5563',
              marginTop: '20px',
              fontFamily: 'sans-serif',
            }}
          >
            나만의 사주 이야기
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
