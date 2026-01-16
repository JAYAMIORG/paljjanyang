import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface DeleteResponse {
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
      return NextResponse.json<DeleteResponse>(
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
      return NextResponse.json<DeleteResponse>(
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

    // 해당 기록이 사용자의 것인지 확인 후 삭제
    const { error: deleteError } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json<DeleteResponse>(
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

    return NextResponse.json<DeleteResponse>({
      success: true,
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json<DeleteResponse>(
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
