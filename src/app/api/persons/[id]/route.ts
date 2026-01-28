import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface DeletePersonResponse {
  success: boolean
  error?: {
    code: string
    message: string
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<DeletePersonResponse>(
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
      return NextResponse.json<DeletePersonResponse>(
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

    // 해당 person이 현재 사용자의 것인지 확인
    const { data: person, error: fetchError } = await supabase
      .from('persons')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !person) {
      return NextResponse.json<DeletePersonResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '프로필을 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      )
    }

    if (person.user_id !== user.id) {
      return NextResponse.json<DeletePersonResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '삭제 권한이 없습니다.',
          },
        },
        { status: 403 }
      )
    }

    // 삭제 실행
    const { error: deleteError } = await supabase
      .from('persons')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Person delete error:', deleteError)
      return NextResponse.json<DeletePersonResponse>(
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

    return NextResponse.json<DeletePersonResponse>({
      success: true,
    })
  } catch (error) {
    console.error('Person delete error:', error)
    return NextResponse.json<DeletePersonResponse>(
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
