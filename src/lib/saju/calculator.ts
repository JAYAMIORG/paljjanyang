import { Solar, Lunar } from 'lunar-typescript'
import type {
  SajuCalculateRequest,
  SajuResult,
  Bazi,
  WuXing,
  ShiShen,
  DaYun,
} from '@/types/saju'
import {
  TIANGAN_KOREAN,
  DIZHI_KOREAN,
  ZODIAC_KOREAN,
  ZODIAC_EMOJI,
  WUXING_KOREAN,
} from '@/types/saju'

/**
 * 사주팔자 계산기
 * lunar-typescript 라이브러리를 사용하여 사주 정보를 계산합니다.
 */
export function calculateSaju(request: SajuCalculateRequest): SajuResult {
  const { birthYear, birthMonth, birthDay, birthHour, isLunar, isLeapMonth, gender } = request

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

  // 시간이 있는 경우 시간 포함하여 재계산
  let eightChar
  if (birthHour !== null && birthHour !== undefined) {
    const solarWithTime = Solar.fromYmdHms(
      lunar.getSolar().getYear(),
      lunar.getSolar().getMonth(),
      lunar.getSolar().getDay(),
      birthHour,
      0,
      0
    )
    eightChar = solarWithTime.getLunar().getEightChar()
  } else {
    eightChar = lunar.getEightChar()
  }

  // 사주팔자 추출
  const bazi: Bazi = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    hour: birthHour !== null && birthHour !== undefined ? eightChar.getTime() : null,
  }

  // 한글 간지 생성
  const koreanGanji = convertToKoreanGanji(bazi)

  // 일간 (Day Master)
  const dayMaster = eightChar.getDayGan()
  const dayMasterWuXing = getDayMasterWuXing(dayMaster)
  const dayMasterKorean = `${TIANGAN_KOREAN[dayMaster] || dayMaster}${dayMasterWuXing}`

  // 오행 분석
  const wuXing = calculateWuXing(eightChar, birthHour !== null && birthHour !== undefined)

  // 십신
  const shiShen: ShiShen = {
    yearGan: eightChar.getYearShiShenGan(),
    monthGan: eightChar.getMonthShiShenGan(),
    hourGan: birthHour !== null && birthHour !== undefined ? eightChar.getTimeShiShenGan() : null,
  }

  // 대운 계산 (0=여성, 1=남성)
  const genderValue = gender === 'male' ? 1 : 0
  const yun = eightChar.getYun(genderValue)
  const daYunList = yun.getDaYun(10)  // 10개 대운

  const daYun: DaYun[] = daYunList.map((dy, index) => ({
    index,
    startAge: dy.getStartAge(),
    endAge: dy.getEndAge(),
    ganZhi: dy.getGanZhi(),
    startYear: dy.getStartYear(),
    endYear: dy.getEndYear(),
  }))

  // 띠
  const zodiacChar = lunar.getYearShengXiao()
  const zodiac = ZODIAC_KOREAN[zodiacChar] || zodiacChar
  const zodiacEmoji = ZODIAC_EMOJI[zodiacChar] || '🐾'

  // 납음
  const naYin = eightChar.getYearNaYin()

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
    daYun,
    zodiac,
    zodiacEmoji,
    naYin,
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
