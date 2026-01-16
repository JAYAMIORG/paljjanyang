export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      persons: {
        Row: {
          id: string
          user_id: string
          name: string
          relationship: 'self' | 'partner' | 'family' | 'friend' | 'other'
          birth_year: number
          birth_month: number
          birth_day: number
          birth_hour: number | null
          is_lunar: boolean
          is_leap_month: boolean
          gender: 'male' | 'female'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relationship: 'self' | 'partner' | 'family' | 'friend' | 'other'
          birth_year: number
          birth_month: number
          birth_day: number
          birth_hour?: number | null
          is_lunar?: boolean
          is_leap_month?: boolean
          gender: 'male' | 'female'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relationship?: 'self' | 'partner' | 'family' | 'friend' | 'other'
          birth_year?: number
          birth_month?: number
          birth_day?: number
          birth_hour?: number | null
          is_lunar?: boolean
          is_leap_month?: boolean
          gender?: 'male' | 'female'
          created_at?: string
          updated_at?: string
        }
      }
      readings: {
        Row: {
          id: string
          user_id: string
          type: 'personal' | 'yearly' | 'compatibility' | 'love'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          person1_id: string | null
          person2_id: string | null
          person1_bazi: Json | null
          person1_wuxing: Json | null
          person1_day_master: string | null
          person2_bazi: Json | null
          person2_wuxing: Json | null
          person2_day_master: string | null
          compatibility_score: number | null
          yearly_year: number | null
          yearly_data: Json | null
          interpretation: Json | null
          korean_ganji: string | null
          coins_used: number
          is_free: boolean
          reward_id: string | null
          transaction_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'personal' | 'yearly' | 'compatibility' | 'love'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          person1_id?: string | null
          person2_id?: string | null
          person1_bazi?: Json | null
          person1_wuxing?: Json | null
          person1_day_master?: string | null
          person2_bazi?: Json | null
          person2_wuxing?: Json | null
          person2_day_master?: string | null
          compatibility_score?: number | null
          yearly_year?: number | null
          yearly_data?: Json | null
          interpretation?: Json | null
          korean_ganji?: string | null
          coins_used?: number
          is_free?: boolean
          reward_id?: string | null
          transaction_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'personal' | 'yearly' | 'compatibility' | 'love'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          person1_id?: string | null
          person2_id?: string | null
          person1_bazi?: Json | null
          person1_wuxing?: Json | null
          person1_day_master?: string | null
          person2_bazi?: Json | null
          person2_wuxing?: Json | null
          person2_day_master?: string | null
          compatibility_score?: number | null
          yearly_year?: number | null
          yearly_data?: Json | null
          interpretation?: Json | null
          korean_ganji?: string | null
          coins_used?: number
          is_free?: boolean
          reward_id?: string | null
          transaction_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      coin_balances: {
        Row: {
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          balance?: number
          updated_at?: string
        }
      }
      coin_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'purchase' | 'spend' | 'reward' | 'refund'
          amount: number
          payment_id: string | null
          target: 'reading' | null
          target_id: string | null
          description: string | null
          balance_before: number
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'purchase' | 'spend' | 'reward' | 'refund'
          amount: number
          payment_id?: string | null
          target?: 'reading' | null
          target_id?: string | null
          description?: string | null
          balance_before: number
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'purchase' | 'spend' | 'reward' | 'refund'
          amount?: number
          payment_id?: string | null
          target?: 'reading' | null
          target_id?: string | null
          description?: string | null
          balance_before?: number
          balance_after?: number
          created_at?: string
        }
      }
      coin_packages: {
        Row: {
          id: string
          name: string
          coins: number
          price: number
          bonus_coins: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          coins: number
          price: number
          bonus_coins?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          coins?: number
          price?: number
          bonus_coins?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          method: 'toss' | 'kakao' | 'card' | null
          status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          package_id: string | null
          coins_purchased: number | null
          external_payment_id: string | null
          external_order_id: string | null
          created_at: string
          completed_at: string | null
          failed_at: string | null
          failure_reason: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          method?: 'toss' | 'kakao' | 'card' | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          package_id?: string | null
          coins_purchased?: number | null
          external_payment_id?: string | null
          external_order_id?: string | null
          created_at?: string
          completed_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          method?: 'toss' | 'kakao' | 'card' | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          package_id?: string | null
          coins_purchased?: number | null
          external_payment_id?: string | null
          external_order_id?: string | null
          created_at?: string
          completed_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          metadata?: Json | null
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          type: 'share' | 'referral' | 'promotion' | 'other'
          status: 'active' | 'used' | 'expired'
          valid_for: string[] | null
          expires_at: string | null
          used_at: string | null
          used_reading_id: string | null
          source_share_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'share' | 'referral' | 'promotion' | 'other'
          status?: 'active' | 'used' | 'expired'
          valid_for?: string[] | null
          expires_at?: string | null
          used_at?: string | null
          used_reading_id?: string | null
          source_share_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'share' | 'referral' | 'promotion' | 'other'
          status?: 'active' | 'used' | 'expired'
          valid_for?: string[] | null
          expires_at?: string | null
          used_at?: string | null
          used_reading_id?: string | null
          source_share_id?: string | null
          created_at?: string
        }
      }
      shares: {
        Row: {
          id: string
          user_id: string
          reading_id: string
          platform: 'instagram' | 'twitter' | 'facebook' | 'kakao' | 'link'
          reward_issued: boolean
          reward_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reading_id: string
          platform: 'instagram' | 'twitter' | 'facebook' | 'kakao' | 'link'
          reward_issued?: boolean
          reward_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reading_id?: string
          platform?: 'instagram' | 'twitter' | 'facebook' | 'kakao' | 'link'
          reward_issued?: boolean
          reward_id?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      add_coins: {
        Args: {
          p_user_id: string
          p_payment_id: string
          p_coins: number
        }
        Returns: number
      }
      create_reading_with_coins: {
        Args: {
          p_user_id: string
          p_type: string
          p_person1_id: string
          p_person2_id?: string
          p_reward_id?: string
        }
        Returns: string
      }
      issue_share_reward: {
        Args: {
          p_user_id: string
          p_reading_id: string
          p_platform: string
        }
        Returns: string
      }
    }
    Enums: {
      reading_type: 'personal' | 'yearly' | 'compatibility' | 'love'
      reading_status: 'pending' | 'processing' | 'completed' | 'failed'
      transaction_type: 'purchase' | 'spend' | 'reward' | 'refund'
      spend_target: 'reading'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
      payment_method: 'toss' | 'kakao' | 'card'
      reward_type: 'share' | 'referral' | 'promotion' | 'other'
      reward_status: 'active' | 'used' | 'expired'
      share_platform: 'instagram' | 'twitter' | 'facebook' | 'kakao' | 'link'
    }
  }
}
