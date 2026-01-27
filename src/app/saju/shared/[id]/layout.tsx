import { Metadata } from 'next'
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://palzza.app'

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
