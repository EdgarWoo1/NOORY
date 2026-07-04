import { useEffect, useMemo, useState } from 'react'
import { listByCategory } from '../lib/postsApi'
import { getCommentCounts } from '../lib/commentsApi'
import { useSeo } from '../lib/seo'
import PageHeader from '../components/PageHeader'
import PostCard from '../components/PostCard'

const PER_PAGE_BY_CATEGORY = { 일기: 9 }
const DEFAULT_PER_PAGE = 8

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
        setPosts(data)
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
