import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

// 천간 → 색상 + 한글 음독
const TIANGAN_INFO: Record<string, { color: string; korean: string }> = {
  '甲': { color: '푸른', korean: '갑' },
  '乙': { color: '푸른', korean: '을' },
  '丙': { color: '빨간', korean: '병' },
  '丁': { color: '빨간', korean: '정' },
  '戊': { color: '노란', korean: '무' },
  '己': { color: '노란', korean: '기' },
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

// 간지에서 일주 동물 별칭 가져오기 (예: 庚戌 → 하얀 강아지(경술일주))
function getJiaziAnimalName(ganZhi: string): string {
  if (!ganZhi || ganZhi.length !== 2) return ''
  const tianganInfo = TIANGAN_INFO[ganZhi[0]]
  const dizhiInfo = DIZHI_INFO[ganZhi[1]]
  if (!tianganInfo || !dizhiInfo) return ''
  return `${tianganInfo.color} ${dizhiInfo.animal}(${tianganInfo.korean}${dizhiInfo.korean}일주)`
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
