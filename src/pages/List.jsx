import { useEffect, useMemo, useState } from 'react'
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
]

// 고정 작품을 우선순위 순서로 앞에 배치하고, 나머지는 기존(날짜) 순서를 유지한다.
// slug 한글이 NFC/NFD로 섞일 수 있어 비교 시 양쪽을 NFC로 정규화한다.
function pinFeatured(posts, category) {
  if (category !== '일기') return posts
  const rank = new Map(PINNED_SLUGS.map((slug, i) => [slug.normalize('NFC'), i]))
  const rankOf = (p) => {
    const r = rank.get((p.slug || '').normalize('NFC'))
    return r === undefined ? Infinity : r
  }
  // Array.prototype.sort는 안정 정렬이므로 동순위는 원래 순서(날짜순)가 유지된다.
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
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    setPage(1)
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
  const pageItems = useMemo(
    () => posts.slice((page - 1) * perPage, page * perPage),
    [posts, page, perPage],
  )

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
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          이전
                        </button>
                      </li>
                      {pageWindow(page, totalPages).map((n) => (
                        <li key={n} className={`page-item${n === page ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(n)}>
                            {n}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item${page === totalPages ? ' disabled' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
