// 사주 계산 요청
export interface SajuCalculateRequest {
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour?: number | null  // 0-23, null이면 시주 제외
  isLunar: boolean           // 음력 여부
  isLeapMonth: boolean       // 윤달 여부
  gender: 'male' | 'female'
}

// 사주팔자 (四柱八字)
export interface Bazi {
  year: string   // 년주 (예: 乙亥)
  month: string  // 월주 (예: 己卯)
  day: string    // 일주 (예: 甲辰)
  hour: string | null  // 시주 (예: 辛未), 시간 없으면 null
}

// 오행 비율 (五行)
export interface WuXing {
  wood: number   // 목 (%)
  fire: number   // 화 (%)
  earth: number  // 토 (%)
  metal: number  // 금 (%)
  water: number  // 수 (%)
}

// 십신 (十神)
export interface ShiShen {
  yearGan: string   // 년간 십신
  monthGan: string  // 월간 십신
  hourGan: string | null  // 시간 십신
}

// 세운/유년 (流年)
export interface LiuNian {
  year: number       // 연도
  age: number        // 나이
  ganZhi: string     // 간지
}

// 사주 계산 결과
export interface SajuResult {
  // 기본 정보
  bazi: Bazi
  koreanGanji: string  // 한글 간지 (예: 을해년 기묘월 갑진일 신미시)
  dayMaster: string    // 일간 (예: 甲)
  dayMasterKorean: string  // 일간 한글 (예: 갑목)

  // 오행 분석
  wuXing: WuXing
  dominantElement: string  // 가장 강한 오행
  weakElement: string      // 가장 약한 오행

  // 십신
  shiShen: ShiShen

  // 기타 정보
  zodiac: string       // 띠 (예: 돼지띠)
  zodiacEmoji: string  // 띠 이모지
  naYin: string        // 납음 (예: 山頭火)
  dayPillarAnimal: string  // 일주 동물 별칭 (예: 황말, 백호)
  dayNaYin: string     // 일주 납음 (예: 钗钏金)
}

// API 응답
export interface SajuApiResponse {
  success: boolean
  data?: SajuResult
  error?: {
    code: string
    message: string
  }
}

// 오행 한글 매핑
export const WUXING_KOREAN: Record<string, string> = {
  '木': '목',
  '火': '화',
  '土': '토',
  '金': '금',
  '水': '수',
}

// 천간 한글 매핑
export const TIANGAN_KOREAN: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
}

// 지지 한글 매핑
export const DIZHI_KOREAN: Record<string, string> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
}

// 띠 이모지 매핑
export const ZODIAC_EMOJI: Record<string, string> = {
  '鼠': '🐀', '牛': '🐂', '虎': '🐅', '兔': '🐇',
  '龙': '🐉', '蛇': '🐍', '马': '🐴', '羊': '🐑',
  '猴': '🐵', '鸡': '🐔', '狗': '🐕', '猪': '🐷',
}

// 띠 한글 매핑
export const ZODIAC_KOREAN: Record<string, string> = {
  '鼠': '쥐띠', '牛': '소띠', '虎': '호랑이띠', '兔': '토끼띠',
  '龙': '용띠', '蛇': '뱀띠', '马': '말띠', '羊': '양띠',
  '猴': '원숭이띠', '鸡': '닭띠', '狗': '개띠', '猪': '돼지띠',
}
