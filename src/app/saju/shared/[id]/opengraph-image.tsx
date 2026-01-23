import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

// 천간 → 색상 + 한글 음독
const TIANGAN_INFO: Record<string, { color: string; korean: string }> = {
  '甲': { color: '푸른', korean: '갑' },
  '乙': { color: '푸른', korean: '을' },
  '丙': { color: '빨간', korean: '병' },
  '丁': { color: '빨간', korean: '정' },
  '戊': { color: '황금', korean: '무' },
  '己': { color: '황금', korean: '기' },
  '庚': { color: '하얀', korean: '경' },
  '辛': { color: '하얀', korean: '신' },
  '壬': { color: '검은', korean: '임' },
  '癸': { color: '검은', korean: '계' },
}

// 지지 → 동물 + 한글 음독
const DIZHI_INFO: Record<string, { animal: string; korean: string }> = {
  '子': { animal: '쥐', korean: '자' },
  '丑': { animal: '소', korean: '축' },
  '寅': { animal: '호랑이', korean: '인' },
  '卯': { animal: '토끼', korean: '묘' },
  '辰': { animal: '용', korean: '진' },
  '巳': { animal: '뱀', korean: '사' },
  '午': { animal: '말', korean: '오' },
  '未': { animal: '양', korean: '미' },
  '申': { animal: '원숭이', korean: '신' },
  '酉': { animal: '닭', korean: '유' },
  '戌': { animal: '강아지', korean: '술' },
  '亥': { animal: '돼지', korean: '해' },
}

// 간지에서 한글 간지만 추출 (예: 庚戌 → 경술)
function getKoreanGanzi(ganZhi: string): string | null {
  if (!ganZhi || ganZhi.length !== 2) return null
  const tianganInfo = TIANGAN_INFO[ganZhi[0]]
  const dizhiInfo = DIZHI_INFO[ganZhi[1]]
  if (!tianganInfo || !dizhiInfo) return null
  return `${tianganInfo.korean}${dizhiInfo.korean}`
}

export const runtime = 'nodejs'
export const alt = '팔자냥 사주 결과'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Base URL
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bazi-azure.vercel.app'

  // 데이터 조회 - 일주의 한자 간지를 직접 가져옴
  let ganziKorean: string | null = null

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: reading } = await supabase
        .from('readings')
        .select('person1_bazi')
        .eq('id', id)
        .single()

      if (reading) {
        const bazi = reading.person1_bazi || {}
        // 한자 간지(庚戌)에서 직접 한글 간지(경술) 추출
        ganziKorean = getKoreanGanzi(bazi.day || '')
      }
    }
  } catch (e) {
    console.error('DB fetch error:', e)
  }

  const isPng = !!ganziKorean
  const imageFileName = ganziKorean ? `${ganziKorean}.png` : 'test.jpg'
  const imageUrl = `${productionUrl}/images/animals/${encodeURIComponent(imageFileName)}`

  // 이미지를 ArrayBuffer로 가져오기
  let imageData: ArrayBuffer | null = null
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const imageResponse = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
      },
    })
    clearTimeout(timeoutId)

    if (imageResponse.ok) {
      imageData = await imageResponse.arrayBuffer()
    } else {
      console.error('Image fetch failed:', imageResponse.status, imageUrl)
    }
  } catch (e) {
    console.error('Failed to fetch image:', e, imageUrl)
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
            src={`data:image/${isPng ? 'png' : 'jpeg'};base64,${Buffer.from(imageData).toString('base64')}`}
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
}
