import { createClient } from '@supabase/supabase-js'

// Service Role Key를 사용하는 Admin Client
// RLS를 우회하여 서버에서 직접 DB 조작 가능
// 주의: 절대 클라이언트에 노출하면 안 됨
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
