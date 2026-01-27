import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SajuResult } from '@/types/saju'

export interface UseCoinRequest {
  type: 'personal' | 'yearly' | 'compatibility' | 'love'
  // 선저장을 위한 사주 정보
  person1: {
    id?: string
    name: string
    gender: string
    birthDate: string
    sajuResult: SajuResult
  }
  person2?: {
    id?: string
    name: string
    gender: string
    birthDate: string
    sajuResult: SajuResult
  }
}

export interface UseCoinResponse {
  success: boolean
  data?: {
    transactionId: string
    remainingBalance: number
    readingId: string  // 생성된 reading ID 반환
  }
  error?: {
    code: string
    message: string
    currentBalance?: number
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json<UseCoinResponse>(
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
      return NextResponse.json<UseCoinResponse>(
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

    const body: UseCoinRequest = await request.json()
    const { type, person1, person2 } = body

    if (!type || !['personal', 'yearly', 'compatibility', 'love'].includes(type)) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: '유효하지 않은 사주 유형입니다.',
          },
        },
        { status: 400 }
      )
    }

    // person1 필수 검증
    if (!person1 || !person1.sajuResult) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '사주 정보가 필요합니다.',
          },
        },
        { status: 400 }
      )
    }

    // 궁합인 경우 person2 필수
    if (type === 'compatibility' && (!person2 || !person2.sajuResult)) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '궁합 분석에는 두 사람의 정보가 필요합니다.',
          },
        },
        { status: 400 }
      )
    }

    // Admin client 생성 (RLS 우회)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'Service Role Key가 설정되지 않았습니다.',
          },
        },
        { status: 500 }
      )
    }

    // 사주 유형별 한국어 이름
    const typeKorean: Record<string, string> = {
      personal: '개인 사주',
      yearly: '신년운세',
      compatibility: '궁합',
      love: '연애운',
    }

    const coinsRequired = 1
    const description = `${typeKorean[type]} 조회`

    // 1. 코인 잔액 확인
    const { data: balanceData } = await adminClient
      .from('coin_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = Number(balanceData?.balance ?? 0)

    if (currentBalance < coinsRequired) {
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_COINS',
            message: '코인이 부족합니다.',
            currentBalance,
          },
        },
        { status: 400 }
      )
    }

    // 2. Person 레코드 생성 또는 조회
    // birthDate 파싱 (예: "2024-1-15")
    const parseBirthDate = (birthDate: string) => {
      const parts = birthDate.split('-')
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2]),
      }
    }

    let person1Id = person1.id || null

    // person1.id가 없으면 새로 생성
    if (!person1Id) {
      const birth1 = parseBirthDate(person1.birthDate)
      const { data: newPerson1, error: person1Error } = await adminClient
        .from('persons')
        .insert({
          user_id: user.id,
          name: person1.name || '나',
          relationship: 'self',
          birth_year: birth1.year,
          birth_month: birth1.month,
          birth_day: birth1.day,
          gender: person1.gender,
        })
        .select('id')
        .single()

      if (person1Error) {
        console.error('[use-coin] Person1 creation error:', person1Error)
      } else {
        person1Id = newPerson1.id
      }
    }

    let person2Id = person2?.id || null

    // 궁합인 경우 person2도 생성
    if (type === 'compatibility' && person2 && !person2Id) {
      const birth2 = parseBirthDate(person2.birthDate)
      const { data: newPerson2, error: person2Error } = await adminClient
        .from('persons')
        .insert({
          user_id: user.id,
          name: person2.name || '상대방',
          relationship: 'partner',
          birth_year: birth2.year,
          birth_month: birth2.month,
          birth_day: birth2.day,
          gender: person2.gender,
        })
        .select('id')
        .single()

      if (person2Error) {
        console.error('[use-coin] Person2 creation error:', person2Error)
      } else {
        person2Id = newPerson2.id
      }
    }

    // 3. Reading 레코드 생성 (status = 'processing')
    const readingData: Record<string, unknown> = {
      user_id: user.id,
      type,
      status: 'processing',
      person1_id: person1Id,
      person1_bazi: person1.sajuResult.bazi,
      person1_wuxing: person1.sajuResult.wuXing,
      person1_day_master: person1.sajuResult.dayMaster,
      korean_ganji: person1.sajuResult.koreanGanji,
      coins_used: coinsRequired,
      is_free: false,
    }

    // 신년운세인 경우 연도 추가
    if (type === 'yearly') {
      readingData.yearly_year = new Date().getFullYear()
    }

    // 궁합인 경우 person2 정보 추가
    if (type === 'compatibility' && person2) {
      readingData.person2_id = person2Id
      readingData.person2_bazi = person2.sajuResult.bazi
      readingData.person2_wuxing = person2.sajuResult.wuXing
      readingData.person2_day_master = person2.sajuResult.dayMaster
    }

    const { data: readingResult, error: readingError } = await adminClient
      .from('readings')
      .insert(readingData)
      .select('id')
      .single()

    if (readingError || !readingResult) {
      console.error('Reading creation error:', readingError)
      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: '분석 요청 생성에 실패했습니다.',
          },
        },
        { status: 500 }
      )
    }

    const readingId = readingResult.id
    console.log('[use-coin] Reading created:', { readingId, userId: user.id, type, status: 'processing' })

    // 3. 코인 차감 (Atomic RPC 함수 사용)
    const { data: rpcResult, error: rpcError } = await adminClient
      .rpc('use_coin', {
        p_user_id: user.id,
        p_amount: coinsRequired,
        p_description: description,
      })

    if (rpcError) {
      console.error('RPC use_coin error:', rpcError)

      // RPC 함수가 없는 경우 fallback
      if (rpcError.code === 'PGRST202') {
        console.warn('use_coin RPC not found, using fallback logic')

        const newBalance = currentBalance - coinsRequired

        await adminClient
          .from('coin_balances')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)

        const { data: txData } = await adminClient
          .from('coin_transactions')
          .insert({
            user_id: user.id,
            type: 'spend',
            amount: -coinsRequired,
            target: 'reading',
            target_id: readingId,
            balance_before: currentBalance,
            balance_after: newBalance,
            description,
          })
          .select('id')
          .single()

        // reading에 transaction_id 업데이트
        await adminClient
          .from('readings')
          .update({ transaction_id: txData?.id })
          .eq('id', readingId)

        return NextResponse.json<UseCoinResponse>({
          success: true,
          data: {
            transactionId: txData?.id || '',
            remainingBalance: newBalance,
            readingId,
          },
        })
      }

      // RPC 오류 시 reading 삭제 (롤백)
      await adminClient.from('readings').delete().eq('id', readingId)

      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: 'RPC_ERROR',
            message: '코인 차감 중 오류가 발생했습니다.',
          },
        },
        { status: 500 }
      )
    }

    // RPC 결과 처리
    const result = rpcResult?.[0]

    if (!result || !result.success) {
      // 코인 차감 실패 시 reading 삭제 (롤백)
      await adminClient.from('readings').delete().eq('id', readingId)

      const errorMessage = result?.error_message || '코인 차감에 실패했습니다.'
      const isInsufficientCoins = errorMessage.includes('부족')

      return NextResponse.json<UseCoinResponse>(
        {
          success: false,
          error: {
            code: isInsufficientCoins ? 'INSUFFICIENT_COINS' : 'USE_COIN_ERROR',
            message: errorMessage,
            currentBalance: result?.new_balance ?? 0,
          },
        },
        { status: 400 }
      )
    }

    // 4. reading에 transaction_id 업데이트
    await adminClient
      .from('readings')
      .update({ transaction_id: result.transaction_id })
      .eq('id', readingId)

    return NextResponse.json<UseCoinResponse>({
      success: true,
      data: {
        transactionId: result.transaction_id || '',
        remainingBalance: result.new_balance,
        readingId,
      },
    })

  } catch (error) {
    console.error('Use coin error:', error)
    return NextResponse.json<UseCoinResponse>(
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
