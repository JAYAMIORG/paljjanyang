import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Solar, Lunar } from 'lunar-typescript'

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
      hour: string | null
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
    zodiac: string // 띠 (예: 쥐띠, 소띠)
    dominantElement: string
    weakElement: string
    dayPillarAnimal: string
    dayNaYin: string
    createdAt: string
    // 궁합용 추가 필드
    name1?: string
    name2?: string
    gender?: string
    gender2?: string
    person2?: {
      bazi: {
        year: string
        month: string
        day: string
        hour: string | null
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
    }
  }
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

// 지지 → 띠 매핑 (이미지 파일명과 일치)
const DIZHI_TO_ZODIAC: Record<string, string> = {
  '子': '쥐띠',
  '丑': '소띠',
  '寅': '호랑이띠',
  '卯': '토끼띠',
  '辰': '용띠',
  '巳': '뱀띠',
  '午': '말띠',
  '未': '양띠',
  '申': '원숭이띠',
  '酉': '닭띠',
  '戌': '개띠',
  '亥': '돼지띠',
}

// 연주(年柱)에서 띠 가져오기
function getZodiacFromYearPillar(yearPillar: string): string {
  if (!yearPillar || yearPillar.length !== 2) return ''
  const dizhi = yearPillar[1] // 지지는 두 번째 글자
  return DIZHI_TO_ZODIAC[dizhi] || ''
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

    // 결과 조회 (person 정보 포함, 궁합용 person2 포함)
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
        person2_bazi,
        person2_wuxing,
        person2_day_master,
        person2_id,
        created_at,
        persons:person1_id (
          name,
          birth_year,
          birth_month,
          birth_day,
          birth_hour,
          is_lunar,
          gender
        ),
        person2:person2_id (
          name,
          gender
        )
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
    const rawBazi = reading.person1_bazi || { year: '', month: '', day: '', time: null }
    const bazi = {
      year: rawBazi.year || '',
      month: rawBazi.month || '',
      day: rawBazi.day || '',
      hour: rawBazi.time || null,
    }
    const dayPillarAnimal = getJiaziAnimalName(bazi.day || '')
    const zodiac = getZodiacFromYearPillar(bazi.year || '')

    // 오행에서 가장 강한/약한 요소 찾기
    const wuXing = reading.person1_wuxing || { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 }
    const entries = Object.entries(wuXing) as [string, number][]
    const dominantEntry = entries.reduce((a, b) => a[1] > b[1] ? a : b)
    const weakEntry = entries.reduce((a, b) => a[1] < b[1] ? a : b)
    const dominantElement = WUXING_KOREAN[dominantEntry[0]] || dominantEntry[0]
    const weakElement = WUXING_KOREAN[weakEntry[0]] || weakEntry[0]

    // 납음 가져오기
    let dayNaYin = ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person = reading.persons as any
    if (person && person.birth_year && person.birth_month && person.birth_day) {
      try {
        let lunar
        if (person.is_lunar) {
          lunar = Lunar.fromYmd(person.birth_year, person.birth_month, person.birth_day)
        } else {
          const solar = Solar.fromYmd(person.birth_year, person.birth_month, person.birth_day)
          lunar = solar.getLunar()
        }

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

        // 일주 납음 가져오기
        dayNaYin = eightChar.getDayNaYin() || ''
      } catch (e) {
        console.error('NaYin calculation error:', e)
      }
    }

    // 궁합용 person2 데이터 구성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person2Info = reading.person2 as any
    let person2Data: {
      bazi: { year: string; month: string; day: string; hour: string | null }
      wuXing: { wood: number; fire: number; earth: number; metal: number; water: number }
      dayMaster: string
      dayMasterKorean: string
      zodiacEmoji: string
      dominantElement: string
      weakElement: string
    } | undefined = undefined

    if (reading.type === 'compatibility' && reading.person2_bazi && reading.person2_wuxing) {
      const p2DayMaster = reading.person2_day_master || ''
      const p2DayMasterInfo = DAY_MASTER_MAP[p2DayMaster] || { korean: p2DayMaster, emoji: '🐱' }
      const p2WuXing = reading.person2_wuxing || { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 }
      const p2Entries = Object.entries(p2WuXing) as [string, number][]
      const p2DominantEntry = p2Entries.reduce((a, b) => a[1] > b[1] ? a : b)
      const p2WeakEntry = p2Entries.reduce((a, b) => a[1] < b[1] ? a : b)
      const rawBazi2 = reading.person2_bazi || { year: '', month: '', day: '', time: null }

      person2Data = {
        bazi: {
          year: rawBazi2.year || '',
          month: rawBazi2.month || '',
          day: rawBazi2.day || '',
          hour: rawBazi2.time || null,
        },
        wuXing: p2WuXing,
        dayMaster: p2DayMaster,
        dayMasterKorean: p2DayMasterInfo.korean,
        zodiacEmoji: p2DayMasterInfo.emoji,
        dominantElement: WUXING_KOREAN[p2DominantEntry[0]] || p2DominantEntry[0],
        weakElement: WUXING_KOREAN[p2WeakEntry[0]] || p2WeakEntry[0],
      }
    }

    // interpretation 처리: save API({ text: string })와 interpret API(직접 객체) 두 형식 모두 지원
    let interpretationText: string | null = null
    if (reading.interpretation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const interp = reading.interpretation as any
      if (typeof interp === 'object' && 'text' in interp && typeof interp.text === 'string') {
        // save API 방식: { text: "..." }
        interpretationText = interp.text
      } else if (typeof interp === 'object') {
        // interpret API 방식: 직접 객체 -> JSON 문자열로 변환
        interpretationText = JSON.stringify(interp)
      }
    }

    return NextResponse.json<SharedReadingResponse>({
      success: true,
      data: {
        id: reading.id,
        type: reading.type,
        koreanGanji: reading.korean_ganji || '',
        interpretation: interpretationText,
        bazi,
        wuXing,
        dayMaster,
        dayMasterKorean: dayMasterInfo.korean,
        zodiacEmoji: dayMasterInfo.emoji,
        zodiac,
        dominantElement,
        weakElement,
        dayPillarAnimal,
        dayNaYin,
        createdAt: reading.created_at,
        // 궁합용 추가 데이터
        name1: person?.name || undefined,
        name2: person2Info?.name || undefined,
        gender: person?.gender || undefined,
        gender2: person2Info?.gender || undefined,
        person2: person2Data,
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
