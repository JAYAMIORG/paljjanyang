/**
 * API 입력값 검증 유틸리티
 */

const currentYear = new Date().getFullYear()

/**
 * 문자열 검증
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): { valid: boolean; error?: string } {
  const { minLength = 0, maxLength = 255, required = false } = options

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName}은(는) 필수입니다.` }
    }
    return { valid: true }
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName}은(는) 문자열이어야 합니다.` }
  }

  if (value.length < minLength) {
    return { valid: false, error: `${fieldName}은(는) ${minLength}자 이상이어야 합니다.` }
  }

  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName}은(는) ${maxLength}자 이하여야 합니다.` }
  }

  return { valid: true }
}

/**
 * 숫자 범위 검증
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean; integer?: boolean } = {}
): { valid: boolean; error?: string } {
  const { min, max, required = false, integer = true } = options

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName}은(는) 필수입니다.` }
    }
    return { valid: true }
  }

  const num = Number(value)
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName}은(는) 숫자여야 합니다.` }
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName}은(는) 정수여야 합니다.` }
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName}은(는) ${min} 이상이어야 합니다.` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName}은(는) ${max} 이하여야 합니다.` }
  }

  return { valid: true }
}

/**
 * 열거형 검증
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
  options: { required?: boolean } = {}
): { valid: boolean; error?: string } {
  const { required = false } = options

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { valid: false, error: `${fieldName}은(는) 필수입니다.` }
    }
    return { valid: true }
  }

  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName}은(는) ${allowedValues.join(', ')} 중 하나여야 합니다.`,
    }
  }

  return { valid: true }
}

/**
 * 생년월일 검증
 */
export function validateBirthDate(
  year: number,
  month: number,
  day: number
): { valid: boolean; error?: string } {
  // 연도 검증
  if (year < 1900 || year > currentYear) {
    return { valid: false, error: `연도는 1900년에서 ${currentYear}년 사이여야 합니다.` }
  }

  // 월 검증
  if (month < 1 || month > 12) {
    return { valid: false, error: '월은 1에서 12 사이여야 합니다.' }
  }

  // 해당 월의 최대 일수 계산
  const daysInMonth = new Date(year, month, 0).getDate()

  // 일 검증
  if (day < 1 || day > daysInMonth) {
    return { valid: false, error: `${month}월의 일은 1에서 ${daysInMonth} 사이여야 합니다.` }
  }

  return { valid: true }
}

/**
 * 시간 검증 (태어난 시간)
 */
export function validateBirthHour(value: unknown): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === -1 || value === '-1') {
    return { valid: true } // 모르겠어요 선택
  }

  const hour = Number(value)
  if (isNaN(hour) || !Number.isInteger(hour)) {
    return { valid: false, error: '시간은 정수여야 합니다.' }
  }

  if (hour < 0 || hour > 23) {
    return { valid: false, error: '시간은 0에서 23 사이여야 합니다.' }
  }

  return { valid: true }
}

/**
 * Person 입력값 일괄 검증
 */
export function validatePersonInput(data: {
  name?: unknown
  relationship?: unknown
  birthYear?: unknown
  birthMonth?: unknown
  birthDay?: unknown
  birthHour?: unknown
  gender?: unknown
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 이름 검증
  const nameResult = validateString(data.name, '이름', { required: true, minLength: 1, maxLength: 50 })
  if (!nameResult.valid && nameResult.error) errors.push(nameResult.error)

  // 관계 검증
  const relationshipResult = validateEnum(
    data.relationship,
    '관계',
    ['self', 'partner', 'family', 'friend', 'other'] as const,
    { required: true }
  )
  if (!relationshipResult.valid && relationshipResult.error) errors.push(relationshipResult.error)

  // 성별 검증
  const genderResult = validateEnum(data.gender, '성별', ['male', 'female'] as const, { required: true })
  if (!genderResult.valid && genderResult.error) errors.push(genderResult.error)

  // 연도, 월, 일 숫자 검증
  const yearResult = validateNumber(data.birthYear, '연도', { required: true, min: 1900, max: currentYear })
  if (!yearResult.valid && yearResult.error) errors.push(yearResult.error)

  const monthResult = validateNumber(data.birthMonth, '월', { required: true, min: 1, max: 12 })
  if (!monthResult.valid && monthResult.error) errors.push(monthResult.error)

  const dayResult = validateNumber(data.birthDay, '일', { required: true, min: 1, max: 31 })
  if (!dayResult.valid && dayResult.error) errors.push(dayResult.error)

  // 날짜 전체 검증 (유효한 날짜인지)
  if (yearResult.valid && monthResult.valid && dayResult.valid) {
    const dateResult = validateBirthDate(
      Number(data.birthYear),
      Number(data.birthMonth),
      Number(data.birthDay)
    )
    if (!dateResult.valid && dateResult.error) errors.push(dateResult.error)
  }

  // 시간 검증
  const hourResult = validateBirthHour(data.birthHour)
  if (!hourResult.valid && hourResult.error) errors.push(hourResult.error)

  return { valid: errors.length === 0, errors }
}
