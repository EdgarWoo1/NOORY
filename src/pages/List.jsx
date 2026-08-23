import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listByCategory } from '../lib/postsApi'
import { getCommentCounts } from '../lib/commentsApi'
import { useSeo } from '../lib/seo'
import PageHeader from '../components/PageHeader'
import PostCard from '../components/PostCard'

const PER_PAGE_BY_CATEGORY = { 일기: 9 }
const DEFAULT_PER_PAGE = 8

// 일기 목록에서 민음사 세계문학전집 수록작을 앞쪽(1~2페이지)에 고정 노출한다.
// 배열 순서 = 노출 우선순위. 앞 11개는 세계문학전집이 확실한 작품,
// 뒤 4개는 판본 여부가 애매하지만 우선 노출하기로 한 작품이다.
const PINNED_SLUGS = [
  'etc_57_괴테와의대화1',
  'etc_8_네루다의 우편배달부',
  'etc_16_미겔스트리트',
  'etc_25_수레바퀴아래서',
  'etc_30_올리버트위스트',
  'etc_31_말',
  'etc_43_달과6펜스',
  'etc_45_면도날',
  'etc_46_이방인',
  'etc_51_위대한 개츠비',
  'etc_52_그리스인조르바',
  'etc_54_파우스트',
  // ↓ 여기부터는 세계문학전집 판본 여부가 애매하나 우선 노출 (위 11개 뒤)
  'etc_6_월든',
  'etc_9_소망 없는 불행',
  'etc_37_노르웨이의숲',
  'etc_55_차라투스트라',
  'etc_56_구토',
]

// 날짜와 무관하게 항상 목록 맨 뒤(마지막 페이지)로 보낼 글.
// 최근 글이지만 뒤쪽에 두고 싶은 경우(예: 추천 리스트)에 사용한다.
const PINNED_LAST_SLUGS = ['etc_58_2026클로드추천리스트']

// 상단 고정 작품은 우선순위 순서로 앞에, 하단 고정 글은 맨 뒤에 배치하고,
// 나머지는 기존(날짜) 순서를 유지한다.
// slug 한글이 NFC/NFD로 섞일 수 있어 비교 시 양쪽을 NFC로 정규화한다.
function pinFeatured(posts, category) {
  if (category !== '일기') return posts
  const topRank = new Map(PINNED_SLUGS.map((slug, i) => [slug.normalize('NFC'), i]))
  const lastRank = new Map(PINNED_LAST_SLUGS.map((slug, i) => [slug.normalize('NFC'), i]))
  const NORMAL = 1_000_000
  const LAST_BASE = 2_000_000
  const rankOf = (p) => {
    const slug = (p.slug || '').normalize('NFC')
    if (topRank.has(slug)) return topRank.get(slug)
    if (lastRank.has(slug)) return LAST_BASE + lastRank.get(slug)
    return NORMAL
  }
  // Array.prototype.sort는 안정 정렬이므로 동순위(NORMAL)는 원래 순서(날짜순)가 유지된다.
  return [...posts].sort((a, b) => rankOf(a) - rankOf(b))
}

// 현재 페이지 주변만 보여 주는 윈도우 (모바일 화면 넘침 방지)
function pageWindow(page, total, span = 2) {
  const start = Math.max(1, page - span)
  const end = Math.min(total, page + span)
  const arr = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
}

const CATEGORY_DESC = {
  일기: '책을 읽고 남긴 독후감과 일상의 생각들을 모았습니다.',
  여행기: '세계 곳곳을 여행하며 남긴 기록과 사진들을 모았습니다.',
  에세이: '삶과 하루에 대해 오래 붙들고 정리한 생각들을 모았습니다.',
}

export default function List({ category }) {
  useSeo({
    title: category,
    description: CATEGORY_DESC[category],
    type: 'website',
  })
  const [posts, setPosts] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  // 현재 페이지는 URL 쿼리(?page=3)에 둔다. 컴포넌트 state로 두면 글 상세로 갔다가
  // 뒤로가기로 돌아왔을 때 마운트가 새로 되며 1페이지로 초기화된다.
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([listByCategory(category), getCommentCounts()]).then(
      ([data, c]) => {
        if (!active) return
        setPosts(pinFeatured(data, category))
        setCounts(c)
        setLoading(false)
      },
    )
    return () => {
      active = false
    }
  }, [category])

  const perPage = PER_PAGE_BY_CATEGORY[category] ?? DEFAULT_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage))
  // 로딩 중에는 posts가 비어 totalPages가 1이므로 그때는 클램프하지 않는다.
  const parsed = Math.floor(Number(searchParams.get('page')))
  const rawPage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  const page = loading ? rawPage : Math.min(rawPage, totalPages)
  const pageItems = useMemo(
    () => posts.slice((page - 1) * perPage, page * perPage),
    [posts, page, perPage],
  )

  // 페이지 이동은 history를 쌓지 않고 현재 항목을 교체한다. 그래야 상세글에서
  // 뒤로가기 한 번에 보고 있던 페이지의 목록으로 돌아온다.
  const goPage = (n) => {
    const next = Math.min(Math.max(1, n), totalPages)
    const params = new URLSearchParams(searchParams)
    if (next === 1) params.delete('page')
    else params.set('page', String(next))
    setSearchParams(params, { replace: true })
    window.scrollTo(0, 0)
  }

  return (
    <>
      <PageHeader title={category} />
      <div className="container-fluid py-5">
        <div className="container py-5">
          {loading ? (
            <p className="text-center text-muted py-5">불러오는 중…</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted py-5">아직 글이 없어요.</p>
          ) : (
            <>
              <div className="row pb-3">
                {pageItems.map((post) => (
                  <div key={post.slug} className="col-lg-4 col-md-6 mb-4 pb-2">
                    <PostCard post={post} count={counts[post.slug] || 0} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="col-12">
                  <nav aria-label="페이지">
                    <ul className="pagination justify-content-center flex-wrap mb-0">
                      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => goPage(page - 1)}
                        >
                          이전
                        </button>
                      </li>
                      {pageWindow(page, totalPages).map((n) => (
                        <li key={n} className={`page-item${n === page ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => goPage(n)}>
                            {n}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item${page === totalPages ? ' disabled' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => goPage(page + 1)}
                        >
                          다음
                        </button>
                      </li>
                    </ul>
                    <p className="text-center text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                      {page} / {totalPages}
                    </p>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
