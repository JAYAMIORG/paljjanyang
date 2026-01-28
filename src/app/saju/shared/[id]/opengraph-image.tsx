import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

// 천간 한글 매핑
const TIANGAN_KOREAN: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
}

// 지지 한글 매핑
const DIZHI_KOREAN: Record<string, string> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
}

// 간지에서 한글 간지 추출 (예: 庚戌 → 경술)
function getKoreanGanzi(ganZhi: string): string | null {
  if (!ganZhi || ganZhi.length !== 2) return null
  const tianganKorean = TIANGAN_KOREAN[ganZhi[0]]
  const dizhiKorean = DIZHI_KOREAN[ganZhi[1]]
  if (!tianganKorean || !dizhiKorean) return null
  return `${tianganKorean}${dizhiKorean}`
}

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

    // DB에서 직접 조회 (result 페이지와 동일한 방식)
    let ganziKorean: string | null = null

    try {
      const supabase = createAdminClient()
      if (supabase) {
        const { data: reading } = await supabase
          .from('readings')
          .select('person1_bazi')
          .eq('id', id)
          .single()

        if (reading?.person1_bazi) {
          // person1_bazi.day에서 한글 간지 추출
          const dayGanZhi = reading.person1_bazi.day || ''
          ganziKorean = getKoreanGanzi(dayGanZhi)
        }
      }
    } catch (e) {
      console.error('DB fetch error:', e)
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
