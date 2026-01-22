import { Metadata } from 'next'
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  // 기본 메타데이터
  let title = '팔자냥 - 사주 결과'
  let description = '친구가 공유한 사주 결과를 확인해보세요!'

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
        const dayPillarAnimal = getJiaziAnimalName(bazi.day || '')
        const typeLabel = TYPE_LABEL[reading.type] || '사주'

        if (dayPillarAnimal) {
          title = `${dayPillarAnimal}의 ${typeLabel} - 팔자냥`
          description = `${reading.korean_ganji || ''} ${dayPillarAnimal}의 ${typeLabel} 결과를 확인해보세요!`
        } else {
          title = `${typeLabel} 결과 - 팔자냥`
          description = `${reading.korean_ganji || ''} ${typeLabel} 결과를 확인해보세요!`
        }
      }
    }
  } catch {
    // 에러 시 기본값 사용
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paljjanyang.com'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/saju/shared/${id}`,
      siteName: '팔자냥',
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function SharedResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
