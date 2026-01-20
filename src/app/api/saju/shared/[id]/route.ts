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
    createdAt: string
  }
  error?: {
    code: string
    message: string
  }
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
        bazi: reading.person1_bazi || { year: '', month: '', day: '', time: '' },
        wuXing,
        dayMaster,
        dayMasterKorean: dayMasterInfo.korean,
        zodiacEmoji: dayMasterInfo.emoji,
        dominantElement,
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
