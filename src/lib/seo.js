// 페이지별 SEO 메타태그(title/description/OG/canonical)를 동적으로 설정하는 훅.
// 외부 라이브러리 없이 document.head를 직접 갱신한다.
import { useEffect } from 'react'

const SITE = '누리일주'
const DEFAULT_TITLE = '누리일주 - 세계일주를 꿈꾸는 20대 청년의 이야기'
const DEFAULT_DESC = '세계일주를 꿈꾸는 20대 청년의 여행기·독후감·에세이를 기록하는 공간.'
const DEFAULT_IMAGE = '/img/carousel-1.jpg'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function absUrl(u) {
  if (!u) return ''
  if (/^https?:\/\//.test(u)) return u
  return window.location.origin + (u.startsWith('/') ? u : '/' + u)
}

export function useSeo({ title, description, image, type = 'website' } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : DEFAULT_TITLE
    const desc = (description || DEFAULT_DESC).replace(/\s+/g, ' ').trim().slice(0, 160)
    const url = window.location.href
    const img = absUrl(image || DEFAULT_IMAGE)

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:site_name', SITE)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)
    upsertLink('canonical', url)
  }, [title, description, image, type])
}
