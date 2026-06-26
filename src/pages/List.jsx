import { useEffect, useMemo, useState } from 'react'
import { listByCategory } from '../lib/postsApi'
import PageHeader from '../components/PageHeader'
import PostCard from '../components/PostCard'

const PER_PAGE = 8

export default function List({ category }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    setPage(1)
    listByCategory(category).then((data) => {
      if (!active) return
      setPosts(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [category])

  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE))
  const pageItems = useMemo(
    () => posts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [posts, page],
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
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="col-12">
                  <nav aria-label="페이지">
                    <ul className="pagination pagination-lg justify-content-center bg-white mb-0">
                      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          이전
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
