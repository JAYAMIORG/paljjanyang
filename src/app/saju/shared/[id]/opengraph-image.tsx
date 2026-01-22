import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

// 천간 → 색상 (오행 기반)
const TIANGAN_COLOR: Record<string, string> = {
  '甲': '청', '乙': '청',
  '丙': '적', '丁': '적',
  '戊': '황', '己': '황',
  '庚': '백', '辛': '백',
  '壬': '흑', '癸': '흑',
}

// 지지 → 동물
const DIZHI_ANIMAL: Record<string, string> = {
  '子': '쥐', '丑': '소', '寅': '호랑이', '卯': '토끼',
  '辰': '용', '巳': '뱀', '午': '말', '未': '양',
  '申': '원숭이', '酉': '닭', '戌': '개', '亥': '돼지',
}

// 간지에서 일주 동물 별칭 가져오기
function getJiaziAnimalName(ganZhi: string): string {
  if (!ganZhi || ganZhi.length !== 2) return ''
  const color = TIANGAN_COLOR[ganZhi[0]] || ''
  const animal = DIZHI_ANIMAL[ganZhi[1]] || ''
  return `${color}${animal}`
}

// 사주 타입 한글명
const TYPE_LABEL: Record<string, string> = {
  personal: '개인 사주',
  yearly: '신년운세',
  compatibility: '궁합',
  love: '연애운',
}

export const runtime = 'edge'
export const alt = '팔자냥 사주 결과'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Base URL - 정적 에셋은 항상 프로덕션 URL 사용 (preview URL fetch 문제 방지)
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bazi-azure.vercel.app'

  // 데이터 조회 (추후 동물별 이미지 분기에 사용)
  let dayPillarAnimal = ''
  let typeLabel = ''

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: reading } = await supabase
        .from('readings')
        .select('type, person1_bazi, korean_ganji')
        .eq('id', id)
        .single()

      if (reading) {
        const bazi = reading.person1_bazi || {}
        dayPillarAnimal = getJiaziAnimalName(bazi.day || '')
        typeLabel = TYPE_LABEL[reading.type] || '사주'
      }
    }
  } catch {
    // 에러 시 기본값 사용
  }

  // TODO: 추후 동물별 이미지 분기 적용
  // const imageFileName = dayPillarAnimal ? `${dayPillarAnimal}.jpg` : 'test.jpg'
  const imageFileName = 'test.jpg'
  const imageUrl = `${productionUrl}/images/animals/${imageFileName}`

  // 이미지를 ArrayBuffer로 가져오기
  let imageData: ArrayBuffer | null = null
  try {
    const imageResponse = await fetch(imageUrl, {
      cache: 'no-store',
    })
    if (imageResponse.ok) {
      imageData = await imageResponse.arrayBuffer()
    }
  } catch (e) {
    console.error('Failed to fetch image:', e)
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
            src={`data:image/jpeg;base64,${Buffer.from(imageData).toString('base64')}`}
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
