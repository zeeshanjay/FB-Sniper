import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rqpslulmmzlxnfkpphpg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types (for TypeScript)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meta_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          token_type: string
          expires_at: string
          scopes: string[]
          meta_user_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          token_type?: string
          expires_at: string
          scopes?: string[]
          meta_user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          token_type?: string
          expires_at?: string
          scopes?: string[]
          meta_user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sniper_logs: {
        Row: {
          id: string
          user_id: string
          action_type: string
          target_id: string | null
          target_type: string | null
          status: string
          error_message: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          target_id?: string | null
          target_type?: string | null
          status: string
          error_message?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          target_id?: string | null
          target_type?: string | null
          status?: string
          error_message?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
      }
      automation_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          target_groups: string[]
          target_pages: string[]
          status: string
          scheduled_at: string | null
          posted_at: string | null
          retry_count: number
          max_retries: number
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          target_groups?: string[]
          target_pages?: string[]
          status?: string
          scheduled_at?: string | null
          posted_at?: string | null
          retry_count?: number
          max_retries?: number
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          target_groups?: string[]
          target_pages?: string[]
          status?: string
          scheduled_at?: string | null
          posted_at?: string | null
          retry_count?: number
          max_retries?: number
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      automation_settings: {
        Row: {
          id: string
          user_id: string
          auto_post_enabled: boolean
          post_frequency: string
          rate_limit_delay: number
          max_posts_per_day: number
          timezone: string
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          auto_post_enabled?: boolean
          post_frequency?: string
          rate_limit_delay?: number
          max_posts_per_day?: number
          timezone?: string
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          auto_post_enabled?: boolean
          post_frequency?: string
          rate_limit_delay?: number
          max_posts_per_day?: number
          timezone?: string
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_dashboard_summary: {
        Row: {
          user_id: string
          email: string
          full_name: string | null
          active_tokens: number
          valid_tokens: number
          total_actions: number
          successful_actions: number
          failed_actions: number
          actions_last_24h: number
          total_posts: number
          pending_posts: number
          posted_posts: number
        }
      }
    }
    Functions: {
      has_active_meta_token: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      get_active_meta_token: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          access_token: string
          expires_at: string
          meta_user_id: string | null
        }
      }
      log_sniper_action: {
        Args: {
          p_user_id: string
          p_action_type: string
          p_target_id?: string | null
          p_target_type?: string | null
          p_status: string
          p_error_message?: string | null
          p_metadata?: Record<string, unknown>
        }
        Returns: string
      }
    }
    Enums: {}
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Helper function to check if user has active Meta token
export async function hasActiveMetaToken(userId: string) {
  const { data, error } = await supabase
    .rpc('has_active_meta_token', { p_user_id: userId })
  
  if (error) throw error
  return data
}

// Helper function to get active Meta token
export async function getActiveMetaToken(userId: string) {
  const { data, error } = await supabase
    .rpc('get_active_meta_token', { p_user_id: userId })
  
  if (error) throw error
  return data
}

// Helper function to log sniper action
export async function logSniperAction(
  userId: string,
  actionType: string,
  targetId?: string | null,
  targetType?: string | null,
  status: string = 'pending',
  errorMessage?: string | null,
  metadata: Record<string, unknown> = {}
) {
  const { data, error } = await supabase
    .rpc('log_sniper_action', {
      p_user_id: userId,
      p_action_type: actionType,
      p_target_id: targetId,
      p_target_type: targetType,
      p_status: status,
      p_error_message: errorMessage,
      p_metadata: metadata
    })
  
  if (error) throw error
  return data
}

// Helper function to get dashboard summary
export async function getDashboardSummary(userId: string) {
  const { data, error } = await supabase
    .from('user_dashboard_summary')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}
