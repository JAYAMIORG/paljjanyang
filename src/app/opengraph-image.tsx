import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '팔자냥 - 나만의 사주 이야기'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://palzza.app'
  const imageUrl = `${productionUrl}/images/og-main.webp`

  let imageData: ArrayBuffer | null = null
  try {
    const response = await fetch(imageUrl, { cache: 'no-store' })
    if (response.ok) {
      imageData = await response.arrayBuffer()
    }
  } catch (e) {
    console.error('Failed to fetch og-main.webp:', e)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        {imageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/webp;base64,${Buffer.from(imageData).toString('base64')}`}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#6B5B95',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 64,
              fontWeight: 'bold',
            }}
          >
            팔자냥
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  )
}
