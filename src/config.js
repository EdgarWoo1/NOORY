// ============================================================
//  Supabase 설정
// ============================================================
//  새 Supabase 프로젝트를 만든 뒤, 대시보드 → Project Settings → API 에서:
//    - Project URL   → supabaseUrl
//    - anon public 키 → supabaseAnonKey
//  두 값을 채우면 로그인 / 글쓰기 기능이 켜집니다.
//  (anon 키는 브라우저에 공개돼도 되는 키이며, 데이터는 RLS로 보호됩니다.)
// ============================================================

export const supabaseConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
}

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.supabaseUrl && supabaseConfig.supabaseAnonKey)
}
