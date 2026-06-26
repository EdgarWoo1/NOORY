// 글 데이터 계층: 기존 정적 글(posts.json) + Supabase 새 글(_TdaPost)을 합친다.
//
//  - 읽기: 정적 글 + DB 글을 합쳐서 보여 준다(검색/목록/홈 모두 통합).
//  - 쓰기: 새 글만 DB(_TdaPost)에 저장한다. 기존 정적 글은 수정 대상이 아니다.
//  - Supabase 미설정/오류 시: 정적 글만으로도 사이트가 정상 동작한다.

import { supabase } from '../supabase'
import { isSupabaseConfigured } from '../config'
import { staticPosts, sortPosts, DEFAULT_THUMB } from '../data/posts'

const TABLE = '_TdaPost'

// DB 행(PascalCase) → 앱에서 쓰는 형태로 변환
function normalize(row) {
  return {
    slug: row.Slug,
    title: row.Title,
    category: row.Category || '일기',
    tag: row.Tag || '',
    date: row.Date || null,
    dateLabel: '',
    thumb: row.Thumb || DEFAULT_THUMB,
    body: row.Body || '',
    source: 'db',
  }
}

function ensureReady() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase가 설정되어 있지 않아 글을 저장할 수 없어요. src/config.js를 확인해 주세요.',
    )
  }
}

async function fetchDbPosts() {
  if (!isSupabaseConfigured() || !supabase) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('Date', { ascending: false })
  if (error || !data) {
    console.warn('Supabase에서 글을 불러오지 못했습니다.', error)
    return []
  }
  return data.map(normalize)
}

// 전체 글(정적 + DB), 최신순
export async function listAll() {
  const db = await fetchDbPosts()
  return sortPosts([...db, ...staticPosts])
}

// 카테고리별
export async function listByCategory(category) {
  const all = await listAll()
  return all.filter((p) => p.category === category)
}

// slug로 한 건 (DB 우선, 없으면 정적)
export async function getBySlug(slug) {
  const db = await fetchDbPosts()
  const found = db.find((p) => p.slug === slug)
  if (found) return found
  return staticPosts.find((p) => p.slug === slug) || null
}

// 새 글 작성 (DB)
export async function createPost(input) {
  ensureReady()
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      Slug: input.slug,
      Title: input.title,
      Category: input.category,
      Tag: input.tag,
      Date: input.date,
      Thumb: input.thumb,
      Body: input.body,
    })
    .select()
    .single()
  if (error) throw error
  return normalize(data)
}

// 글 수정 (DB 글만)
export async function updatePost(slug, input) {
  ensureReady()
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      Title: input.title,
      Category: input.category,
      Tag: input.tag,
      Thumb: input.thumb,
      Body: input.body,
    })
    .eq('Slug', slug)
    .select()
    .single()
  if (error) throw error
  return normalize(data)
}

// 글 삭제 (DB 글만)
export async function deletePost(slug) {
  ensureReady()
  const { error } = await supabase.from(TABLE).delete().eq('Slug', slug)
  if (error) throw error
}
