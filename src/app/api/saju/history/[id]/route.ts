import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Solar, Lunar } from 'lunar-typescript'

export interface ReadingDetailResponse {
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
      time: string | null
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
    weakElement: string
    daYun: Array<{
      startAge: number
      endAge: number
      ganZhi: string
    }>
    dayPillarAnimal: string
    dayNaYin: string
    createdAt: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface DeleteResponse {
  success: boolean
  error?: {
    code: string
    message: string
  }
}

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

// GET: 특정 기록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<ReadingDetailResponse>(
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

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ReadingDetailResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
          },
        },
        { status: 401 }
      )
    }

    // 해당 기록 조회 (사용자 본인 것만, person 정보 포함)
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
        person1_id,
        created_at,
        persons:person1_id (
          birth_year,
          birth_month,
          birth_day,
          birth_hour,
          is_lunar,
          gender
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !reading) {
      return NextResponse.json<ReadingDetailResponse>(
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

    // 오행에서 가장 강한/약한 요소 찾기
    const wuXing = reading.person1_wuxing || { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 }
    const entries = Object.entries(wuXing) as [string, number][]
    const dominantEntry = entries.reduce((a, b) => a[1] > b[1] ? a : b)
    const weakEntry = entries.reduce((a, b) => a[1] < b[1] ? a : b)
    const dominantElement = WUXING_KOREAN[dominantEntry[0]] || dominantEntry[0]
    const weakElement = WUXING_KOREAN[weakEntry[0]] || weakEntry[0]

    // 대운 재계산
    let daYun: Array<{ startAge: number; endAge: number; ganZhi: string }> = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person = reading.persons as any
    if (person && person.birth_year && person.birth_month && person.birth_day) {
      try {
        let lunar
        if (person.is_lunar) {
          // 음력 입력인 경우
          lunar = Lunar.fromYmd(person.birth_year, person.birth_month, person.birth_day)
        } else {
          // 양력 입력인 경우
          const solar = Solar.fromYmd(person.birth_year, person.birth_month, person.birth_day)
          lunar = solar.getLunar()
        }

        // 시간이 있으면 시간 포함하여 계산
        let eightChar
        if (person.birth_hour !== null && person.birth_hour !== undefined) {
          const solarDate = lunar.getSolar()
          const solarWithTime = Solar.fromYmdHms(
            solarDate.getYear(),
            solarDate.getMonth(),
            solarDate.getDay(),
            person.birth_hour,
            0,
            0
          )
          eightChar = solarWithTime.getLunar().getEightChar()
        } else {
          eightChar = lunar.getEightChar()
        }

        // 대운 계산 (0=여성, 1=남성)
        const genderValue = person.gender === 'male' ? 1 : 0
        const yun = eightChar.getYun(genderValue)
        const daYunList = yun.getDaYun(10)

        daYun = daYunList.map((dy: { getStartAge: () => number; getEndAge: () => number; getGanZhi: () => string }) => ({
          startAge: dy.getStartAge(),
          endAge: dy.getEndAge(),
          ganZhi: dy.getGanZhi(),
        }))
      } catch (e) {
        console.error('DaYun calculation error:', e)
      }
    }

    // 일주 동물 별칭 (예: 황말, 백개)
    const bazi = reading.person1_bazi || { year: '', month: '', day: '', time: null }
    const dayPillarAnimal = getJiaziAnimalName(bazi.day || '')

    return NextResponse.json<ReadingDetailResponse>({
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
        weakElement,
        daYun,
        dayPillarAnimal,
        dayNaYin: '', // DB에 저장되지 않음
        createdAt: reading.created_at,
      },
    })
  } catch (error) {
    console.error('Reading fetch error:', error)
    return NextResponse.json<ReadingDetailResponse>(
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

// DELETE: 특정 기록 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<DeleteResponse>(
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

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
          },
        },
        { status: 401 }
      )
    }

    // 해당 기록이 사용자의 것인지 확인 후 삭제
    const { data: deletedData, error: deleteError } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: '삭제에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 삭제된 레코드가 없는 경우 (존재하지 않거나 권한 없음)
    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '삭제할 기록을 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json<DeleteResponse>({
      success: true,
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json<DeleteResponse>(
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
