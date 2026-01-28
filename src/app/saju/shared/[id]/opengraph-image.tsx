import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = '팔자냥 사주 결과'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://palzza.app'

    // API를 통해 데이터 가져오기 (DB 직접 조회 대신)
    let ganziKorean: string | null = null

    try {
      const apiController = new AbortController()
      const apiTimeoutId = setTimeout(() => apiController.abort(), 5000)

      const apiResponse = await fetch(`${productionUrl}/api/saju/shared/${id}`, {
        cache: 'no-store',
        signal: apiController.signal,
      })
      clearTimeout(apiTimeoutId)

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        if (data.success && data.data?.dayPillarAnimal) {
          // dayPillarAnimal에서 한글 간지 추출 (예: "황금 돼지(기해일주)" → "기해")
          const match = data.data.dayPillarAnimal.match(/\(([가-힣]{2})/)
          ganziKorean = match ? match[1] : null
        }
      }
    } catch (e) {
      console.error('API fetch error:', e)
    }

    // 이미지 URL 생성 (result 페이지와 동일한 방식)
    const imageFileName = ganziKorean ? `${ganziKorean}.webp` : null
    const imageUrl = imageFileName
      ? `${productionUrl}/images/animals/${encodeURIComponent(imageFileName)}`
      : null

    // 이미지 가져오기 (result 페이지와 동일한 방식)
    let imageData: ArrayBuffer | null = null
    if (imageUrl) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const imageResponse = await fetch(imageUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'image/*' },
        })
        clearTimeout(timeoutId)

        if (imageResponse.ok) {
          imageData = await imageResponse.arrayBuffer()
        } else {
          console.error('Image fetch failed:', imageResponse.status, imageUrl)
        }
      } catch (e) {
        console.error('Image fetch error:', e)
      }
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
                fontSize: 48,
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
  } catch (e) {
    console.error('OG Image error:', e)
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
}
