import { NextRequest, NextResponse } from 'next/server'
import { calculateSaju } from '@/lib/saju/calculator'
import type { SajuCalculateRequest, SajuApiResponse } from '@/types/saju'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력값 검증
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json<SajuApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.message,
          },
        },
        { status: 400 }
      )
    }

    // 요청 데이터 정리
    const sajuRequest: SajuCalculateRequest = {
      birthYear: Number(body.birthYear),
      birthMonth: Number(body.birthMonth),
      birthDay: Number(body.birthDay),
      birthHour: body.birthHour !== null && body.birthHour !== undefined
        ? Number(body.birthHour)
        : null,
      birthMinute: body.birthMinute !== null && body.birthMinute !== undefined
        ? Number(body.birthMinute)
        : 0,
      isLunar: Boolean(body.isLunar),
      isLeapMonth: Boolean(body.isLeapMonth),
      gender: body.gender as 'male' | 'female',
    }

    // 사주 계산
    const result = calculateSaju(sajuRequest)

    return NextResponse.json<SajuApiResponse>({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Saju calculation error:', error)

    return NextResponse.json<SajuApiResponse>(
      {
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: error instanceof Error ? error.message : '사주 계산 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    )
  }
}

interface ValidationResult {
  valid: boolean
  message: string
}

function validateRequest(body: Record<string, unknown>): ValidationResult {
  // 필수 필드 확인
  if (!body.birthYear) {
    return { valid: false, message: '생년(birthYear)은 필수입니다.' }
  }
  if (!body.birthMonth) {
    return { valid: false, message: '생월(birthMonth)은 필수입니다.' }
  }
  if (!body.birthDay) {
    return { valid: false, message: '생일(birthDay)은 필수입니다.' }
  }
  if (!body.gender) {
    return { valid: false, message: '성별(gender)은 필수입니다.' }
  }

  // 타입/범위 검증
  const year = Number(body.birthYear)
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    return { valid: false, message: '유효하지 않은 생년입니다. (1900 ~ 현재년도)' }
  }

  const month = Number(body.birthMonth)
  if (isNaN(month) || month < 1 || month > 12) {
    return { valid: false, message: '유효하지 않은 생월입니다. (1-12)' }
  }

  const day = Number(body.birthDay)
  if (isNaN(day) || day < 1 || day > 31) {
    return { valid: false, message: '유효하지 않은 생일입니다. (1-31)' }
  }

  if (body.birthHour !== null && body.birthHour !== undefined) {
    const hour = Number(body.birthHour)
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return { valid: false, message: '유효하지 않은 시간입니다. (0-23)' }
    }
  }

  if (body.gender !== 'male' && body.gender !== 'female') {
    return { valid: false, message: 'gender는 male 또는 female이어야 합니다.' }
  }

  return { valid: true, message: '' }
}
