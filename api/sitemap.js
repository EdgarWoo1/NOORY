// /sitemap.xml을 요청 시점에 만든다. 정적 글 + Supabase 새 글이 모두 들어가므로
// 글을 추가해도 따로 사이트맵을 손볼 필요가 없다.
import { listPosts, SITE_URL } from './_posts.js'

const PAGES = ['/', '/travel', '/diary', '/essay', '/search', '/contact']

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// slug는 저장된 형태 그대로 인코딩한다. 옛 글 상당수가 NFD로 저장돼 있고, 앱이 slug를
// 정확히 일치로 찾기 때문에 NFC로 바꾸면 그 주소에서 글을 못 찾는다(기존 사이트맵과 동일).
export function renderSitemap(posts) {
  const urls = [
    ...PAGES.map((p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n  </url>`),
    ...posts.map((p) => {
      const loc = `${SITE_URL}/post/${encodeURIComponent(p.slug)}`
      const date = /^\d{4}-\d{2}-\d{2}/.test(p.date || '') ? p.date.slice(0, 10) : ''
      return `  <url>\n    <loc>${esc(loc)}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ''}\n  </url>`
    }),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export default async function handler(req, res) {
  const posts = await listPosts()
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(renderSitemap(posts))
}
