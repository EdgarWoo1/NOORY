// Vercel 서버리스 함수(api/*)가 함께 쓰는 글 조회 헬퍼. 파일명이 _로 시작해 함수로 배포되지 않는다.
// 정적 글(src/data/posts.json) + Supabase 새 글(_TdaPost)을 합쳐 본다. 앱 쪽 postsApi.js와 같은 규칙.
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const staticPosts = require('../src/data/posts.json')

export const SITE_URL = 'https://noory.kr'
const SUPABASE_URL = 'https://pfrthfieouyqacsjkbvd.supabase.co'
// src/config.js와 같은 공개(anon) 키. 읽기 전용이며 데이터는 RLS로 보호된다.
const SUPABASE_KEY = 'sb_publishable_9OVRl7UVAvAnhcz3NeFXHg_EZP0v52l'

// slug 한글이 NFC/NFD로 섞일 수 있어 비교 시 NFC로 정규화한다.
const nfc = (s) => String(s || '').normalize('NFC')

function fromStatic(p) {
  // text 필드는 '제목 본문…' 형태라 앞의 제목을 떼어 요약으로 쓴다.
  const text = p.text || ''
  const bookTitle = (p.title || '').replace(/^\[[^\]]*\]\s*/, '')
  // 여행기처럼 text가 비어 있는 글은 본문 HTML에서 요약을 뽑는다(태그는 렌더 시 제거).
  const summary = text ? (text.startsWith(bookTitle) ? text.slice(bookTitle.length) : text) : p.bodyHtml || ''
  return { slug: p.slug, title: p.title, category: p.category, date: p.date, thumb: p.thumb, summary }
}

function fromDb(row) {
  return {
    slug: row.Slug,
    title: row.Title,
    category: row.Category === '일기' ? '독후감' : row.Category,
    date: row.Date,
    thumb: row.Thumb,
    summary: row.Body || '',
  }
}

async function fetchDb(query) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/_TdaPost?${query}`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return []
    return (await res.json()).map(fromDb)
  } catch {
    // Supabase 장애 시에도 정적 글만으로 응답한다.
    return []
  }
}

export async function findPost(slug) {
  const key = nfc(slug)
  // DB 우선, 없으면 정적 (postsApi.getBySlug와 동일)
  const [db] = await fetchDb(`select=Slug,Title,Category,Date,Thumb,Body&Slug=eq.${encodeURIComponent(key)}`)
  if (db) return db
  const p = staticPosts.find((x) => nfc(x.slug) === key)
  return p ? fromStatic(p) : null
}

export async function listPosts() {
  const db = await fetchDb('select=Slug,Title,Category,Date,Thumb')
  const seen = new Set(db.map((p) => nfc(p.slug)))
  return [...db, ...staticPosts.filter((p) => !seen.has(nfc(p.slug))).map(fromStatic)]
}
