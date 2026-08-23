// 기존 사이트(누리일주)에서 추출한 정적 글 데이터.
// posts.json 은 build 스크립트(extract.py)로 기존 HTML에서 자동 생성되었다.
import raw from './posts.json'

export const DEFAULT_THUMB = '/img/blog-1.jpg'

// 정적 글: source 표시를 붙여 둔다.
export const staticPosts = raw.map((p) => ({ ...p, source: 'static' }))

// 주의: Write.jsx가 CATEGORIES[1]을 기본 카테고리(일기)로 쓰므로 앞 두 개의 순서는 유지한다.
export const CATEGORIES = ['여행기', '일기', '에세이']

// 날짜(ISO 또는 null) → 카드 배지에 쓸 라벨.
export function dateBadge(post) {
  if (post.dateLabel) {
    // 기존 글: '22.10.30' 같은 라벨을 그대로 사용
    return post.dateLabel
  }
  if (post.date) {
    const d = new Date(post.date)
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(
      d.getDate(),
    ).padStart(2, '0')}`
  }
  return ''
}

// 정렬 기준: 날짜(있으면) 내림차순, 없으면 order 기준.
export function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.date && b.date) return a.date < b.date ? 1 : -1
    if (a.date) return -1
    if (b.date) return 1
    return (a.order ?? 0) - (b.order ?? 0)
  })
}
