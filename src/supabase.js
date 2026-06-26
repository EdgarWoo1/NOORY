import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, isSupabaseConfigured } from './config'

// 설정이 채워져 있을 때만 클라이언트를 만든다.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseAnonKey)
  : null
