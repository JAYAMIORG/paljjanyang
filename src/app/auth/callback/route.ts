import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.redirect(`${origin}/auth/login?error=supabase_not_configured`)
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 오류 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/login`)
}
