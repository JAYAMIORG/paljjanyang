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

// 납음 한글 번역 및 설명
export const NAYIN_INFO: Record<string, { korean: string; description: string }> = {
  // 금(金)
  '海中金': { korean: '해중금', description: '바다 속 금, 깊이 있고 신비로운 매력' },
  '剑锋金': { korean: '검봉금', description: '칼날의 금, 날카롭고 결단력 있는 성격' },
  '白蜡金': { korean: '백랍금', description: '흰 밀랍 금, 순수하고 고귀한 품성' },
  '砂中金': { korean: '사중금', description: '모래 속 금, 숨겨진 재능과 가치' },
  '金箔金': { korean: '금박금', description: '금박, 화려하고 세련된 외모' },
  '钗钏金': { korean: '비녀금', description: '비녀와 팔찌의 금, 섬세하고 우아한 성격' },
  // 목(木)
  '大林木': { korean: '대림목', description: '큰 숲의 나무, 포용력과 성장력' },
  '杨柳木': { korean: '양류목', description: '버드나무, 유연하고 적응력 있는 성격' },
  '松柏木': { korean: '송백목', description: '소나무와 잣나무, 굳건하고 절개 있는 성품' },
  '平地木': { korean: '평지목', description: '평지의 나무, 안정적이고 온화한 성격' },
  '桑柘木': { korean: '상자목', description: '뽕나무, 실용적이고 근면한 성품' },
  '石榴木': { korean: '석류목', description: '석류나무, 풍요롭고 다산의 기운' },
  // 수(水)
  '涧下水': { korean: '간하수', description: '계곡물, 맑고 순수한 마음' },
  '泉中水': { korean: '천중수', description: '샘물, 끊임없는 생명력과 활력' },
  '长流水': { korean: '장류수', description: '흐르는 물, 꾸준하고 지속적인 노력' },
  '天河水': { korean: '천하수', description: '은하수, 높은 이상과 꿈' },
  '大溪水': { korean: '대계수', description: '큰 시냇물, 넓은 포용력과 적응력' },
  '大海水': { korean: '대해수', description: '바닷물, 깊고 넓은 도량' },
  // 화(火)
  '炉中火': { korean: '노중화', description: '화로 불, 따뜻하고 열정적인 성격' },
  '山头火': { korean: '산두화', description: '산 위의 불, 밝고 눈에 띄는 존재감' },
  '霹雳火': { korean: '벽력화', description: '번개 불, 강렬하고 폭발적인 에너지' },
  '山下火': { korean: '산하화', description: '산 아래 불, 은은하고 지속적인 열정' },
  '覆灯火': { korean: '복등화', description: '등불, 희망과 지혜의 빛' },
  '天上火': { korean: '천상화', description: '하늘의 불(태양), 밝고 리더십 있는 성품' },
  // 토(土)
  '壁上土': { korean: '벽상토', description: '담벼락 흙, 보호하고 지키는 성품' },
  '城头土': { korean: '성두토', description: '성벽 흙, 든든하고 믿음직한 성격' },
  '沙中土': { korean: '사중토', description: '모래 속 흙, 유연하고 변화에 강함' },
  '路旁土': { korean: '노방토', description: '길가의 흙, 실용적이고 현실적인 성품' },
  '大驿土': { korean: '대역토', description: '큰 역참의 흙, 넓은 인맥과 소통 능력' },
  '屋上土': { korean: '옥상토', description: '지붕 흙, 안정과 가정을 중시하는 성품' },
}

// 납음 정보 가져오기
export function getNaYinInfo(naYin: string): { korean: string; description: string } {
  return NAYIN_INFO[naYin] || { korean: naYin, description: '' }
}
