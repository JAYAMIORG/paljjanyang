/**
 * 사주 관련 상수 정의
 */

// 오행 색상
export const WUXING_COLORS: Record<string, string> = {
  wood: '#7FB069',
  fire: '#FF6B6B',
  earth: '#FFB366',
  metal: '#A8A8A8',
  water: '#4ECDC4',
}

// 오행 한글명
export const WUXING_KOREAN: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

// 일간 오행 이모지 매핑
export const DAY_MASTER_EMOJI: Record<string, string> = {
  '甲': '🌳', '乙': '🌿',
  '丙': '☀️', '丁': '🕯️',
  '戊': '⛰️', '己': '🏔️',
  '庚': '⚔️', '辛': '💎',
  '壬': '🌊', '癸': '💧',
}

// 일간에서 이모지 가져오기
export function getDayMasterEmoji(dayMaster: string): string {
  return DAY_MASTER_EMOJI[dayMaster] || '🐱'
}

// 오행별 성격 특성
export function getPersonalityByElement(element: string): string {
  const traits: Record<string, string> = {
    '목(木)': '성장과 발전을 추구하는 진취적인 성격입니다',
    '화(火)': '열정적이고 활동적인 에너지가 넘칩니다',
    '토(土)': '안정적이고 신뢰감을 주는 성격입니다',
    '금(金)': '결단력이 있고 원칙을 중시합니다',
    '수(水)': '지혜롭고 유연한 사고를 가지고 있습니다',
  }
  return traits[element] || '균형 잡힌 성격입니다'
}

// 천간 → 색상 + 한글 음독
export const TIANGAN_INFO: Record<string, { color: string; korean: string }> = {
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
export const DIZHI_INFO: Record<string, { animal: string; korean: string }> = {
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

// 간지에서 육십갑자 별칭 가져오기 (예: 庚戌 → 하얀 강아지(경술일주))
export function getJiaziAnimalName(ganZhi: string): string {
  if (!ganZhi || ganZhi.length !== 2) return ''
  const tianganInfo = TIANGAN_INFO[ganZhi[0]]
  const dizhiInfo = DIZHI_INFO[ganZhi[1]]
  if (!tianganInfo || !dizhiInfo) return ''
  return `${tianganInfo.color} ${dizhiInfo.animal}(${tianganInfo.korean}${dizhiInfo.korean}일주)`
}

// 납음 한글 번역 및 설명 (hooking한 표현)
export const NAYIN_INFO: Record<string, { korean: string; description: string }> = {
  // 금(金)
  '海中金': { korean: '해중금', description: '깊이를 알 수 없는 신비로운 매력의 소유자' },
  '剑锋金': { korean: '검봉금', description: '타고난 승부사의 DNA' },
  '白蜡金': { korean: '백랍금', description: '범접할 수 없는 고귀한 아우라' },
  '砂中金': { korean: '사중금', description: '감춰진 보석 같은 잠재력' },
  '金箔金': { korean: '금박금', description: '시선을 사로잡는 화려한 존재감' },
  '钗钏金': { korean: '비녀금', description: '우아함 속에 숨은 강인함' },
  // 목(木)
  '大林木': { korean: '대림목', description: '모든 것을 품는 대인배의 기운' },
  '杨柳木': { korean: '양류목', description: '어디서든 살아남는 생존 본능' },
  '松柏木': { korean: '송백목', description: '누구도 꺾을 수 없는 불굴의 의지' },
  '平地木': { korean: '평지목', description: '묵묵히 성공을 쌓아가는 끈기' },
  '桑柘木': { korean: '상자목', description: '알짜배기 실속파의 재물운' },
  '石榴木': { korean: '석류목', description: '풍요와 다산을 부르는 복덩어리' },
  // 수(水)
  '涧下水': { korean: '간하수', description: '맑은 영혼이 끌어당기는 행운' },
  '泉中水': { korean: '천중수', description: '마르지 않는 에너지의 원천' },
  '长流水': { korean: '장류수', description: '끝내 목표를 이루는 집념' },
  '天河水': { korean: '천하수', description: '범상치 않은 스케일의 꿈' },
  '大溪水': { korean: '대계수', description: '어디든 스며드는 적응의 달인' },
  '大海水': { korean: '대해수', description: '끝없이 깊은 그릇의 대물' },
  // 화(火)
  '炉中火': { korean: '노중화', description: '주변을 녹이는 따스한 카리스마' },
  '山头火': { korean: '산두화', description: '어디서든 빛나는 센터 기질' },
  '霹雳火': { korean: '벽력화', description: '한 방에 판도를 바꾸는 폭발력' },
  '山下火': { korean: '산하화', description: '꺼지지 않는 열정의 불씨' },
  '覆灯火': { korean: '복등화', description: '어둠 속 길을 밝히는 지혜' },
  '天上火': { korean: '천상화', description: '태양처럼 빛나는 타고난 리더' },
  // 토(土)
  '壁上土': { korean: '벽상토', description: '소중한 것을 지키는 수호자' },
  '城头土': { korean: '성두토', description: '흔들리지 않는 신뢰의 아이콘' },
  '沙中土': { korean: '사중토', description: '변화에 강한 유연한 전략가' },
  '路旁土': { korean: '노방토', description: '현실 감각 만렙 실속파' },
  '大驿土': { korean: '대역토', description: '인맥이 곧 재산인 네트워커' },
  '屋上土': { korean: '옥상토', description: '가정을 든든히 지키는 가장' },
}

// 납음 정보 가져오기
export function getNaYinInfo(naYin: string): { korean: string; description: string } {
  return NAYIN_INFO[naYin] || { korean: naYin, description: '' }
}

// 천간 오행 매핑
export const TIANGAN_WUXING: Record<string, { element: string; elementKr: string; yinYang: '+' | '-'; korean: string }> = {
  '甲': { element: 'wood', elementKr: '나무木', yinYang: '+', korean: '갑' },
  '乙': { element: 'wood', elementKr: '나무木', yinYang: '-', korean: '을' },
  '丙': { element: 'fire', elementKr: '불火', yinYang: '+', korean: '병' },
  '丁': { element: 'fire', elementKr: '불火', yinYang: '-', korean: '정' },
  '戊': { element: 'earth', elementKr: '흙土', yinYang: '+', korean: '무' },
  '己': { element: 'earth', elementKr: '흙土', yinYang: '-', korean: '기' },
  '庚': { element: 'metal', elementKr: '쇠金', yinYang: '+', korean: '경' },
  '辛': { element: 'metal', elementKr: '쇠金', yinYang: '-', korean: '신' },
  '壬': { element: 'water', elementKr: '물水', yinYang: '+', korean: '임' },
  '癸': { element: 'water', elementKr: '물水', yinYang: '-', korean: '계' },
}

// 지지 오행 매핑
export const DIZHI_WUXING: Record<string, { element: string; elementKr: string; yinYang: '+' | '-'; korean: string }> = {
  '子': { element: 'water', elementKr: '물水', yinYang: '+', korean: '자' },
  '丑': { element: 'earth', elementKr: '흙土', yinYang: '-', korean: '축' },
  '寅': { element: 'wood', elementKr: '나무木', yinYang: '+', korean: '인' },
  '卯': { element: 'wood', elementKr: '나무木', yinYang: '-', korean: '묘' },
  '辰': { element: 'earth', elementKr: '흙土', yinYang: '+', korean: '진' },
  '巳': { element: 'fire', elementKr: '불火', yinYang: '+', korean: '사' },
  '午': { element: 'fire', elementKr: '불火', yinYang: '-', korean: '오' },
  '未': { element: 'earth', elementKr: '흙土', yinYang: '-', korean: '미' },
  '申': { element: 'metal', elementKr: '쇠金', yinYang: '+', korean: '신' },
  '酉': { element: 'metal', elementKr: '쇠金', yinYang: '-', korean: '유' },
  '戌': { element: 'earth', elementKr: '흙土', yinYang: '+', korean: '술' },
  '亥': { element: 'water', elementKr: '물水', yinYang: '-', korean: '해' },
}

// 오행별 배경색 (CSS class용)
export const WUXING_BG_COLORS: Record<string, string> = {
  wood: 'bg-green-500',
  fire: 'bg-red-400',
  earth: 'bg-yellow-400',
  metal: 'bg-gray-300',
  water: 'bg-blue-400',
}

// 오행별 텍스트색 (CSS class용)
export const WUXING_TEXT_COLORS: Record<string, string> = {
  wood: 'text-white',
  fire: 'text-white',
  earth: 'text-gray-800',
  metal: 'text-gray-800',
  water: 'text-white',
}
