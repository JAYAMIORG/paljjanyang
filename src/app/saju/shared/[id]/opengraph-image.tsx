import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

// 천간 → 색상 (친근한 표현 + 한자어)
const TIANGAN_COLOR: Record<string, { friendly: string; short: string }> = {
  '甲': { friendly: '푸른', short: '청' },
  '乙': { friendly: '푸른', short: '청' },
  '丙': { friendly: '빨간', short: '적' },
  '丁': { friendly: '빨간', short: '적' },
  '戊': { friendly: '노란', short: '황' },
  '己': { friendly: '노란', short: '황' },
  '庚': { friendly: '하얀', short: '백' },
  '辛': { friendly: '하얀', short: '백' },
  '壬': { friendly: '검은', short: '흑' },
  '癸': { friendly: '검은', short: '흑' },
}

// 지지 → 동물 (친근한 표현 + 한자어)
const DIZHI_ANIMAL: Record<string, { friendly: string; short: string }> = {
  '子': { friendly: '쥐', short: '쥐' },
  '丑': { friendly: '소', short: '소' },
  '寅': { friendly: '호랑이', short: '호' },
  '卯': { friendly: '토끼', short: '토' },
  '辰': { friendly: '용', short: '용' },
  '巳': { friendly: '뱀', short: '사' },
  '午': { friendly: '말', short: '마' },
  '未': { friendly: '양', short: '양' },
  '申': { friendly: '원숭이', short: '원' },
  '酉': { friendly: '닭', short: '닭' },
  '戌': { friendly: '강아지', short: '개' },
  '亥': { friendly: '돼지', short: '돼' },
}

// 간지에서 일주 동물 별칭 가져오기 (예: 庚戌 → 하얀 강아지 (백개))
function getJiaziAnimalName(ganZhi: string): string {
  if (!ganZhi || ganZhi.length !== 2) return ''
  const colorInfo = TIANGAN_COLOR[ganZhi[0]]
  const animalInfo = DIZHI_ANIMAL[ganZhi[1]]
  if (!colorInfo || !animalInfo) return ''
  return `${colorInfo.friendly} ${animalInfo.friendly} (${colorInfo.short}${animalInfo.short})`
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
