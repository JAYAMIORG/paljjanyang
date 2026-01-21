import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePersonInput } from '@/lib/utils'

export interface Person {
  id: string
  name: string
  relationship: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number | null
  is_lunar: boolean
  gender: string
  created_at: string
}

export interface PersonsResponse {
  success: boolean
  data?: Person[]
  error?: {
    code: string
    message: string
  }
}

export interface CreatePersonResponse {
  success: boolean
  data?: Person
  error?: {
    code: string
    message: string
  }
}

// GET: 저장된 인물 목록 조회
export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<PersonsResponse>(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<PersonsResponse>(
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

    const { data: persons, error } = await supabase
      .from('persons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Persons fetch error:', error)
      return NextResponse.json<PersonsResponse>(
        {
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: '인물 목록을 불러오는데 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json<PersonsResponse>({
      success: true,
      data: persons || [],
    })
  } catch (error) {
    console.error('Persons API error:', error)
    return NextResponse.json<PersonsResponse>(
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

// POST: 새 인물 저장
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<CreatePersonResponse>(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<CreatePersonResponse>(
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

    const body = await request.json()
    const { name, relationship, birthYear, birthMonth, birthDay, birthHour, isLunar, gender } = body

    // 입력값 검증
    const validation = validatePersonInput({
      name,
      relationship,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      gender,
    })

    if (!validation.valid) {
      return NextResponse.json<CreatePersonResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.errors[0] || '입력값이 올바르지 않습니다.',
          },
        },
        { status: 400 }
      )
    }

    const { data: person, error } = await supabase
      .from('persons')
      .insert({
        user_id: user.id,
        name,
        relationship,
        birth_year: birthYear,
        birth_month: birthMonth,
        birth_day: birthDay,
        birth_hour: birthHour ?? null,
        is_lunar: isLunar ?? false,
        is_leap_month: false,
        gender,
      })
      .select()
      .single()

    if (error) {
      console.error('Person create error:', error)
      return NextResponse.json<CreatePersonResponse>(
        {
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: '인물 저장에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json<CreatePersonResponse>({
      success: true,
      data: person,
    })
  } catch (error) {
    console.error('Person create API error:', error)
    return NextResponse.json<CreatePersonResponse>(
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
