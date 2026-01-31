import { Solar, Lunar } from 'lunar-typescript'
import type {
  SajuCalculateRequest,
  SajuResult,
  Bazi,
  WuXing,
  ShiShen,
} from '@/types/saju'
import {
  TIANGAN_KOREAN,
  DIZHI_KOREAN,
  ZODIAC_KOREAN,
  ZODIAC_EMOJI,
  WUXING_KOREAN,
} from '@/types/saju'
import { getJiaziAnimalName } from './constants'

/**
 * 한국 썸머타임(일광절약시간제) 적용 기간
 * 썸머타임 기간에는 시계가 1시간 앞당겨져 있으므로 -60분 추가 보정 필요
 */
const SUMMER_TIME_PERIODS: Array<{ year: number; start: { month: number; day: number }; end: { month: number; day: number } }> = [
  // 1차: 미군정 및 건국 초기 (1948-1951)
  { year: 1948, start: { month: 6, day: 1 }, end: { month: 9, day: 12 } },
  { year: 1949, start: { month: 4, day: 3 }, end: { month: 9, day: 10 } },
  { year: 1950, start: { month: 4, day: 1 }, end: { month: 9, day: 9 } },
  { year: 1951, start: { month: 5, day: 6 }, end: { month: 9, day: 8 } },
  // 2차: 이승만 정부 (1955-1960)
  { year: 1955, start: { month: 5, day: 5 }, end: { month: 9, day: 8 } },
  { year: 1956, start: { month: 5, day: 20 }, end: { month: 9, day: 29 } },
  { year: 1957, start: { month: 5, day: 5 }, end: { month: 9, day: 21 } },
  { year: 1958, start: { month: 5, day: 4 }, end: { month: 9, day: 20 } },
  { year: 1959, start: { month: 5, day: 3 }, end: { month: 9, day: 19 } },
  { year: 1960, start: { month: 5, day: 1 }, end: { month: 9, day: 17 } },
  // 3차: 서울 올림픽 (1987-1988)
  { year: 1987, start: { month: 5, day: 10 }, end: { month: 10, day: 10 } },
  { year: 1988, start: { month: 5, day: 8 }, end: { month: 10, day: 8 } },
]

/**
 * 썸머타임 적용 여부 확인
 */
function isSummerTimePeriod(year: number, month: number, day: number): boolean {
  const period = SUMMER_TIME_PERIODS.find(p => p.year === year)
  if (!period) return false

  const startDate = new Date(year, period.start.month - 1, period.start.day)
  const endDate = new Date(year, period.end.month - 1, period.end.day)
  const checkDate = new Date(year, month - 1, day)

  return checkDate >= startDate && checkDate <= endDate
}

/**
 * 진태양시 보정 (서울 기준 + 썸머타임)
 * - 서울 경도 보정: -32분 (동경 135도 → 127도)
 * - 썸머타임 보정: -60분 (해당 기간에만)
 */
function adjustToTrueSolarTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
  applySummerTime: boolean = false
): { year: number; month: number; day: number; hour: number; minute: number } {
  const TRUE_SOLAR_TIME_OFFSET = 32 // 서울 기준 보정값 (분)
  const SUMMER_TIME_OFFSET = applySummerTime ? 60 : 0 // 썸머타임 보정값 (분)

  // Date 객체를 사용하여 시간 계산
  const date = new Date(year, month - 1, day, hour, minute)
  date.setMinutes(date.getMinutes() - TRUE_SOLAR_TIME_OFFSET - SUMMER_TIME_OFFSET)

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  }
}

/**
 * 사주팔자 계산기
 * lunar-typescript 라이브러리를 사용하여 사주 정보를 계산합니다.
 */
export function calculateSaju(request: SajuCalculateRequest): SajuResult {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, isLunar, isLeapMonth, gender } = request

  // Solar/Lunar 객체 생성
  let lunar: Lunar

  if (isLunar) {
    // 음력 입력인 경우
    lunar = Lunar.fromYmd(birthYear, birthMonth, birthDay)
    if (isLeapMonth) {
      // 윤달 처리 - lunar-typescript에서 윤달은 별도 처리 필요
      // 현재는 기본 처리
    }
  } else {
    // 양력 입력인 경우
    const solar = Solar.fromYmd(birthYear, birthMonth, birthDay)
    lunar = solar.getLunar()
  }

  // 썸머타임 적용 여부 확인 (양력 날짜 기준)
  const solarYear = lunar.getSolar().getYear()
  const solarMonth = lunar.getSolar().getMonth()
  const solarDay = lunar.getSolar().getDay()
  const summerTimeApplied = isSummerTimePeriod(solarYear, solarMonth, solarDay)

  // 시간이 있는 경우 시간 포함하여 재계산 (진태양시 보정 적용)
  // 전통 방식: 진태양시 보정으로 날짜가 바뀌더라도 일주는 원래 입력한 날짜 사용
  // 시주만 보정된 시간으로 계산
  let eightChar
  let eightCharForTime // 시주 계산용 (진태양시 보정 적용)

  if (birthHour !== null && birthHour !== undefined) {
    // 원래 날짜 + 시간으로 년주/월주/일주 계산
    const solarOriginal = Solar.fromYmdHms(
      solarYear,
      solarMonth,
      solarDay,
      birthHour,
      birthMinute ?? 0,
      0
    )
    eightChar = solarOriginal.getLunar().getEightChar()

    // 진태양시 보정 적용하여 시주만 계산 (서울 기준 + 썸머타임)
    const adjusted = adjustToTrueSolarTime(
      solarYear,
      solarMonth,
      solarDay,
      birthHour,
      birthMinute ?? 0,
      summerTimeApplied  // 썸머타임 적용 여부 전달
    )

    const solarAdjusted = Solar.fromYmdHms(
      adjusted.year,
      adjusted.month,
      adjusted.day,
      adjusted.hour,
      adjusted.minute,
      0
    )
    eightCharForTime = solarAdjusted.getLunar().getEightChar()
  } else {
    eightChar = lunar.getEightChar()
    eightCharForTime = eightChar
  }

  // 사주팔자 추출
  // 년주/월주/일주는 원래 날짜 기준, 시주는 진태양시 보정된 시간 기준
  const bazi: Bazi = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    hour: birthHour !== null && birthHour !== undefined ? eightCharForTime.getTime() : null,
  }

  // 한글 간지 생성
  const koreanGanji = convertToKoreanGanji(bazi)

  // 일간 (Day Master)
  const dayMaster = eightChar.getDayGan()
  const dayMasterWuXing = getDayMasterWuXing(dayMaster)
  const dayMasterKorean = `${TIANGAN_KOREAN[dayMaster] || dayMaster}${dayMasterWuXing}`

  // 오행 분석 (시주는 진태양시 보정된 것 사용)
  const wuXing = calculateWuXingWithSeparateTime(eightChar, eightCharForTime, birthHour !== null && birthHour !== undefined)

  // 십신 (시주 십신은 진태양시 보정된 것 사용)
  const shiShen: ShiShen = {
    yearGan: eightChar.getYearShiShenGan(),
    monthGan: eightChar.getMonthShiShenGan(),
    hourGan: birthHour !== null && birthHour !== undefined ? eightCharForTime.getTimeShiShenGan() : null,
  }

  // 띠
  const zodiacChar = lunar.getYearShengXiao()
  const zodiac = ZODIAC_KOREAN[zodiacChar] || zodiacChar
  const zodiacEmoji = ZODIAC_EMOJI[zodiacChar] || '🐾'

  // 납음
  const naYin = eightChar.getYearNaYin()

  // 일주 동물 별칭 (예: 戊午 → 황말)
  const dayPillarAnimal = getJiaziAnimalName(bazi.day)

  // 일주 납음
  const dayNaYin = eightChar.getDayNaYin()

  // 가장 강한/약한 오행 찾기
  const wuXingEntries = Object.entries(wuXing) as [keyof WuXing, number][]
  const sorted = wuXingEntries.sort((a, b) => b[1] - a[1])
  const dominantElement = getElementKorean(sorted[0][0])
  const weakElement = getElementKorean(sorted[sorted.length - 1][0])

  return {
    bazi,
    koreanGanji,
    dayMaster,
    dayMasterKorean,
    wuXing,
    dominantElement,
    weakElement,
    shiShen,
    zodiac,
    zodiacEmoji,
    naYin,
    dayPillarAnimal,
    dayNaYin,
    summerTimeApplied,
  }
}

/**
 * 간지를 한글로 변환
 */
function convertToKoreanGanji(bazi: Bazi): string {
  const convertPillar = (pillar: string): string => {
    if (!pillar || pillar.length !== 2) return pillar
    const gan = TIANGAN_KOREAN[pillar[0]] || pillar[0]
    const zhi = DIZHI_KOREAN[pillar[1]] || pillar[1]
    return `${gan}${zhi}`
  }

  const parts = [
    `${convertPillar(bazi.year)}년`,
    `${convertPillar(bazi.month)}월`,
    `${convertPillar(bazi.day)}일`,
  ]

  if (bazi.hour) {
    parts.push(`${convertPillar(bazi.hour)}시`)
  }

  return parts.join(' ')
}

/**
 * 오행 비율 계산
 */
function calculateWuXing(eightChar: ReturnType<Lunar['getEightChar']>, hasHour: boolean): WuXing {
  // 각 기둥의 오행을 수집
  const elements: string[] = []

  // 년주
  elements.push(eightChar.getYearGan())
  elements.push(eightChar.getYearZhi())

  // 월주
  elements.push(eightChar.getMonthGan())
  elements.push(eightChar.getMonthZhi())

  // 일주
  elements.push(eightChar.getDayGan())
  elements.push(eightChar.getDayZhi())

  // 시주 (있는 경우)
  if (hasHour) {
    elements.push(eightChar.getTimeGan())
    elements.push(eightChar.getTimeZhi())
  }

  // 오행별 개수 카운트
  const count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }

  // 천간 오행 매핑
  const ganWuXing: Record<string, keyof typeof count> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water',
  }

  // 지지 오행 매핑 (본기 기준)
  const zhiWuXing: Record<string, keyof typeof count> = {
    '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
    '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
    '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
  }

  elements.forEach((el) => {
    if (ganWuXing[el]) {
      count[ganWuXing[el]]++
    } else if (zhiWuXing[el]) {
      count[zhiWuXing[el]]++
    }
  })

  // 백분율로 변환
  const total = Object.values(count).reduce((a, b) => a + b, 0)

  return {
    wood: Math.round((count.wood / total) * 100),
    fire: Math.round((count.fire / total) * 100),
    earth: Math.round((count.earth / total) * 100),
    metal: Math.round((count.metal / total) * 100),
    water: Math.round((count.water / total) * 100),
  }
}

/**
 * 오행 비율 계산 (시주는 별도 eightChar에서 가져옴)
 * 전통 방식: 년주/월주/일주는 원래 날짜, 시주는 진태양시 보정된 시간
 */
function calculateWuXingWithSeparateTime(
  eightChar: ReturnType<Lunar['getEightChar']>,
  eightCharForTime: ReturnType<Lunar['getEightChar']>,
  hasHour: boolean
): WuXing {
  const elements: string[] = []

  // 년주 (원래 날짜 기준)
  elements.push(eightChar.getYearGan())
  elements.push(eightChar.getYearZhi())

  // 월주 (원래 날짜 기준)
  elements.push(eightChar.getMonthGan())
  elements.push(eightChar.getMonthZhi())

  // 일주 (원래 날짜 기준)
  elements.push(eightChar.getDayGan())
  elements.push(eightChar.getDayZhi())

  // 시주 (진태양시 보정된 시간 기준)
  if (hasHour) {
    elements.push(eightCharForTime.getTimeGan())
    elements.push(eightCharForTime.getTimeZhi())
  }

  // 오행별 개수 카운트
  const count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }

  const ganWuXing: Record<string, keyof typeof count> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water',
  }

  const zhiWuXing: Record<string, keyof typeof count> = {
    '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
    '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
    '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
  }

  elements.forEach((el) => {
    if (ganWuXing[el]) {
      count[ganWuXing[el]]++
    } else if (zhiWuXing[el]) {
      count[zhiWuXing[el]]++
    }
  })

  const total = Object.values(count).reduce((a, b) => a + b, 0)

  return {
    wood: Math.round((count.wood / total) * 100),
    fire: Math.round((count.fire / total) * 100),
    earth: Math.round((count.earth / total) * 100),
    metal: Math.round((count.metal / total) * 100),
    water: Math.round((count.water / total) * 100),
  }
}

/**
 * 영문 오행을 한글로 변환
 */
function getElementKorean(element: string): string {
  const map: Record<string, string> = {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  }
  return map[element] || element
}

/**
 * 천간에서 오행 추출 (한글)
 */
function getDayMasterWuXing(gan: string): string {
  const map: Record<string, string> = {
    '甲': '목', '乙': '목',
    '丙': '화', '丁': '화',
    '戊': '토', '己': '토',
    '庚': '금', '辛': '금',
    '壬': '수', '癸': '수',
  }
  return map[gan] || ''
}
