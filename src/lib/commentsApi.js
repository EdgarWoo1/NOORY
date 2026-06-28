// 댓글 데이터 계층 (Supabase _TdaComment).
//  - 읽기/쓰기: 누구나 (로그인 불필요)
//  - 삭제: 로그인한 관리자만
import { supabase } from '../supabase'
import { isSupabaseConfigured } from '../config'

const TABLE = '_TdaComment'

function normalize(row) {
  return {
    id: row.No,
    postSlug: row.PostSlug,
    name: row.Name,
    body: row.Body,
    createdAt: row.CreatedAt,
  }
}

export function commentsEnabled() {
  return isSupabaseConfigured() && Boolean(supabase)
}

export async function listComments(postSlug) {
  if (!commentsEnabled()) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('PostSlug', postSlug)
    .order('CreatedAt', { ascending: true })
  if (error || !data) {
    console.warn('댓글을 불러오지 못했습니다.', error)
    return []
  }
  return data.map(normalize)
}

// 글별 댓글 개수 맵 { slug: count } 을 한 번에 가져온다.
export async function getCommentCounts() {
  if (!commentsEnabled()) return {}
  const { data, error } = await supabase.from(TABLE).select('PostSlug')
  if (error || !data) {
    console.warn('댓글 개수를 불러오지 못했습니다.', error)
    return {}
  }
  const map = {}
  for (const r of data) {
    map[r.PostSlug] = (map[r.PostSlug] || 0) + 1
  }
  return map
}

export async function addComment(postSlug, name, body) {
  if (!commentsEnabled()) throw new Error('댓글 기능이 설정되어 있지 않아요.')
  const { error } = await supabase.from(TABLE).insert({
    PostSlug: postSlug,
    Name: name,
    Body: body,
  })
  if (error) throw error
}

export async function deleteComment(id) {
  if (!commentsEnabled()) throw new Error('댓글 기능이 설정되어 있지 않아요.')
  const { error } = await supabase.from(TABLE).delete().eq('No', id)
  if (error) throw error
}
