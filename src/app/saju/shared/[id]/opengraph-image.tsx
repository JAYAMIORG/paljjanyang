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

  // 데이터 조회
  let title = '팔자냥'
  let subtitle = 'MZ세대를 위한 사주 서비스'
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
        title = dayPillarAnimal ? `${dayPillarAnimal}의 ${typeLabel}` : typeLabel
        subtitle = reading.korean_ganji || ''
      }
    }
  } catch {
    // 에러 시 기본값 사용
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF9F5',
          backgroundImage: 'linear-gradient(135deg, #FFF9F5 0%, #FFE5D9 100%)',
        }}
      >
        {/* 타이틀 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#D35400',
              margin: 0,
              marginBottom: 16,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 32,
              color: '#666',
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* 브랜드 */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: '#999',
            }}
          >
            팔자냥 - MZ세대를 위한 사주 서비스
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
