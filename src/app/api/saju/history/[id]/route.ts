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

// 일간(day master)에 따른 한글명 매핑
const DAY_MASTER_MAP: Record<string, string> = {
  '甲': '갑목',
  '乙': '을목',
  '丙': '병화',
  '丁': '정화',
  '戊': '무토',
  '己': '기토',
  '庚': '경금',
  '辛': '신금',
  '壬': '임수',
  '癸': '계수',
}

// 띠 이모지 매핑
const ZODIAC_EMOJI: Record<string, string> = {
  '鼠': '🐀', '牛': '🐂', '虎': '🐅', '兔': '🐇',
  '龙': '🐉', '蛇': '🐍', '马': '🐴', '羊': '🐑',
  '猴': '🐵', '鸡': '🐔', '狗': '🐕', '猪': '🐷',
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
    const dayMasterKorean = DAY_MASTER_MAP[dayMaster] || dayMaster

    // 오행에서 가장 강한/약한 요소 찾기
    const wuXing = reading.person1_wuxing || { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 }
    const entries = Object.entries(wuXing) as [string, number][]
    const dominantEntry = entries.reduce((a, b) => a[1] > b[1] ? a : b)
    const weakEntry = entries.reduce((a, b) => a[1] < b[1] ? a : b)
    const dominantElement = WUXING_KOREAN[dominantEntry[0]] || dominantEntry[0]
    const weakElement = WUXING_KOREAN[weakEntry[0]] || weakEntry[0]

    // 대운 재계산 및 띠 이모지 계산
    let daYun: Array<{ startAge: number; endAge: number; ganZhi: string }> = []
    let zodiacEmoji = '🐱' // 기본값

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

        // 띠 계산
        const zodiacChar = lunar.getYearShengXiao()
        zodiacEmoji = ZODIAC_EMOJI[zodiacChar] || '🐾'

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

    return NextResponse.json<ReadingDetailResponse>({
      success: true,
      data: {
        id: reading.id,
        type: reading.type,
        koreanGanji: reading.korean_ganji || '',
        interpretation: reading.interpretation?.text || null,
        bazi: reading.person1_bazi || { year: '', month: '', day: '', time: null },
        wuXing,
        dayMaster,
        dayMasterKorean,
        zodiacEmoji,
        dominantElement,
        weakElement,
        daYun,
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
    const { error: deleteError } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

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
