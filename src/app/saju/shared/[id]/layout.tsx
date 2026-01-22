import { Metadata } from 'next'
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
