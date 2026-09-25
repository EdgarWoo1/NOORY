// /post/:slug 요청에 글별 제목·요약·표지를 메타태그로 박은 index.html을 돌려준다.
// 카카오톡·네이버·페이스북 링크 미리보기 봇은 자바스크립트를 실행하지 않아서,
// 브라우저에서 useSeo가 바꾸는 메타태그로는 글별 미리보기가 나오지 않기 때문이다.
// 사람이 보는 화면은 그대로 SPA가 그린다.
import { findPost, SITE_URL } from './_posts.js'

const SITE = '누리일주'
const DEFAULT_IMAGE = '/img/carousel-1.jpg'
const DEFAULT_DESC = '세계일주를 꿈꾸는 20대 청년의 여행기·독후감·에세이를 기록하는 공간.'

let template = null

async function getTemplate(req) {
  if (template) return template
  // 빌드 결과물 index.html(해시 붙은 JS/CSS 경로 포함)을 같은 배포에서 받아온다.
  // /index.html은 실제 파일이라 rewrite를 타지 않으므로 이 함수로 되돌아오지 않는다.
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const res = await fetch(`${proto}://${host}/index.html`)
  if (!res.ok) throw new Error(`index.html ${res.status}`)
  template = await res.text()
  return template
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const absUrl = (u) => (/^https?:\/\//.test(u) ? u : SITE_URL + (u.startsWith('/') ? u : '/' + u))

export function renderHead(html, post, url) {
  const title = `${post.title} | ${SITE}`
  const desc =
    post.summary
      .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || DEFAULT_DESC
  const image = absUrl(post.thumb || DEFAULT_IMAGE)
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<meta property="og:site_name" content="${SITE}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
  ].join('\n    ')
  // 기본값 태그를 걷어내고 글별 태그로 교체한다.
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[\s\S]*?\/>\s*/g, '')
    .replace('</head>', `  ${tags}\n  </head>`)
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || '')
  let html
  try {
    html = await getTemplate(req)
  } catch {
    // 템플릿을 못 받으면 캐시하지 않고 오류를 돌려준다(다음 요청에서 다시 받는다).
    res.setHeader('Cache-Control', 'no-store')
    return res.status(502).send('잠시 후 다시 시도해 주세요.')
  }
  const post = await findPost(slug)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // 새 글·수정 글이 늦어도 5분 안에 반영되도록 짧게 캐시한다.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
  if (!post) return res.status(404).send(html)
  const url = `${SITE_URL}/post/${encodeURIComponent(post.slug)}`
  return res.status(200).send(renderHead(html, post, url))
}
