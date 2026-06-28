import { useEffect, useMemo, useState } from 'react'
import { listAll } from '../lib/postsApi'
import { getCommentCounts } from '../lib/commentsApi'
import PageHeader from '../components/PageHeader'
import PostCard from '../components/PostCard'

export default function Search() {
  const [all, setAll] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([listAll(), getCommentCounts()]).then(([data, c]) => {
      if (!active) return
      setAll(data)
      setCounts(c)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return all.filter((p) => {
      const haystack = [p.title, p.tag, p.category, p.text, p.body]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query, all])

  return (
    <>
      <PageHeader title="검색" crumb="검색" />
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="input-group">
                <input
                  type="search"
                  className="form-control border-primary"
                  style={{ padding: 25 }}
                  placeholder="제목, 내용, 태그로 검색하세요…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <div className="input-group-append">
                  <span className="btn btn-primary px-4">
                    <i className="fa fa-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted">불러오는 중…</p>
          ) : !query.trim() ? (
            <p className="text-center text-muted">검색어를 입력해 보세요.</p>
          ) : results.length === 0 ? (
            <p className="text-center text-muted">
              '{query}'에 해당하는 글을 찾지 못했어요.
            </p>
          ) : (
            <>
              <p className="text-center text-muted mb-4">
                {results.length}개의 글을 찾았어요.
              </p>
              <div className="row pb-3">
                {results.map((post) => (
                  <div key={post.slug} className="col-lg-4 col-md-6 mb-4 pb-2">
                    <PostCard post={post} count={counts[post.slug] || 0} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
