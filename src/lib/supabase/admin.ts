import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Service Role Key를 사용하는 Admin Client
// RLS를 우회하여 서버에서 직접 DB 조작 가능
// 주의: 절대 클라이언트에 노출하면 안 됨

// 싱글톤 인스턴스 (Vercel 함수 인스턴스 내에서 재사용)
let adminClient: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient | null {
  // 이미 생성된 클라이언트가 있으면 재사용
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // 커넥션 풀링 최적화
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-connection-pool': 'true',
      },
    },
  })

  return adminClient
}
