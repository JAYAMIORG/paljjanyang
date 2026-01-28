import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Vercel Cron Job에서 호출됨
// 매일 자정(KST)에 오래된 daily 기록 삭제
export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // 한국 시간(KST) 기준 오늘 00:00 계산
    const now = new Date()
    const kstOffset = 9 * 60 * 60 * 1000
    const kstNow = new Date(now.getTime() + kstOffset)
    const todayKST = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate())
    const todayStartUTC = new Date(todayKST.getTime() - kstOffset)

    // 오늘 이전에 생성된 모든 daily 기록 삭제
    const { data, error } = await supabase
      .from('readings')
      .delete()
      .eq('type', 'daily')
      .lt('created_at', todayStartUTC.toISOString())
      .select('id')

    if (error) {
      console.error('Failed to delete old daily readings:', error)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    const deletedCount = data?.length || 0
    console.log(`Deleted ${deletedCount} old daily readings`)

    return NextResponse.json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
