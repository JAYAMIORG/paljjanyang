'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js'

type AuthResult<T = unknown> = { data: T | null; error: AuthError | Error | null }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }, [supabase])

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }, [supabase])

  const signInWithKakao = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }, [supabase])

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }, [supabase])

  const signOut = useCallback(async (): Promise<{ error: AuthError | Error | null }> => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [supabase])

  return {
    user,
    loading,
    isConfigured: !!supabase,
    signInWithEmail,
    signUpWithEmail,
    signInWithKakao,
    signInWithGoogle,
    signOut,
  }
}
