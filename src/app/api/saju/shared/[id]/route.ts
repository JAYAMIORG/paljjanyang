import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface SharedReadingResponse {
  success: boolean
  data?: {
    id: string
    type: string
    koreanGanji: string
    interpretation: string | null
    bazi: {
      year: string
      month: string
      day: string
      time: string
    }
    wuXing: {
      wood: number
      fire: number
      earth: number
      metal: number
      water: number
    }
    dayMaster: string
    dayMasterKorean: string
    zodiacEmoji: string
    dominantElement: string
    dayPillarAnimal: string
    createdAt: string
  }
  error?: {
    code: string
    message: string
  }
}

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

// 일간(day master)에 따른 한글명과 이모지 매핑
const DAY_MASTER_MAP: Record<string, { korean: string; emoji: string }> = {
  '甲': { korean: '갑목', emoji: '🌳' },
  '乙': { korean: '을목', emoji: '🌿' },
  '丙': { korean: '병화', emoji: '☀️' },
  '丁': { korean: '정화', emoji: '🕯️' },
  '戊': { korean: '무토', emoji: '⛰️' },
  '己': { korean: '기토', emoji: '🏔️' },
  '庚': { korean: '경금', emoji: '⚔️' },
  '辛': { korean: '신금', emoji: '💎' },
  '壬': { korean: '임수', emoji: '🌊' },
  '癸': { korean: '계수', emoji: '💧' },
}

// 오행 한글명 매핑
const WUXING_KOREAN: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Admin 클라이언트 사용 (RLS 우회 - 공개 조회용)
    const supabase = createAdminClient()

    if (!supabase) {
      return NextResponse.json<SharedReadingResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'Supabase가 설정되지 않았습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 결과 조회
    const { data: reading, error } = await supabase
      .from('readings')
      .select(`
        id,
        type,
        korean_ganji,
        interpretation,
        person1_bazi,
        person1_wuxing,
        person1_day_master,
        created_at
      `)
      .eq('id', id)
      .single()

    if (error || !reading) {
      return NextResponse.json<SharedReadingResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '결과를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      )
    }

    // 일간 정보 가져오기
    const dayMaster = reading.person1_day_master || ''
    const dayMasterInfo = DAY_MASTER_MAP[dayMaster] || { korean: dayMaster, emoji: '🐱' }

    // 일주 동물 별칭 (예: 황말, 백개)
    const bazi = reading.person1_bazi || { year: '', month: '', day: '', time: '' }
    const dayPillarAnimal = getJiaziAnimalName(bazi.day || '')

    // 오행에서 가장 강한 요소 찾기
    const wuXing = reading.person1_wuxing || { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 }
    const dominantEntry = Object.entries(wuXing).reduce((a, b) =>
      (a[1] as number) > (b[1] as number) ? a : b
    )
    const dominantElement = WUXING_KOREAN[dominantEntry[0]] || dominantEntry[0]

    return NextResponse.json<SharedReadingResponse>({
      success: true,
      data: {
        id: reading.id,
        type: reading.type,
        koreanGanji: reading.korean_ganji || '',
        interpretation: reading.interpretation?.text || null,
        bazi,
        wuXing,
        dayMaster,
        dayMasterKorean: dayMasterInfo.korean,
        zodiacEmoji: dayMasterInfo.emoji,
        dominantElement,
        dayPillarAnimal,
        createdAt: reading.created_at,
      },
    })
  } catch (error) {
    console.error('Shared reading fetch error:', error)
    return NextResponse.json<SharedReadingResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
