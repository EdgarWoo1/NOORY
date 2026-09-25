import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listByCategory } from '../lib/postsApi'
import { getCommentCounts } from '../lib/commentsApi'
import { useSeo } from '../lib/seo'
import PageHeader from '../components/PageHeader'
import PostCard from '../components/PostCard'
import { pinFeatured, perPageOf } from '../lib/postOrder'

// 현재 페이지 주변 + 첫/마지막 페이지를 보여 준다. 사이가 비면 '…'로 줄인다.
// 1페이지 ↔ 마지막 페이지를 한 번에 오갈 수 있게 하면서 모바일 화면 넘침은 막는다.
// 빈 구간이 딱 한 페이지뿐이면 '…' 대신 그 번호를 그대로 보여 준다.
function pageWindow(page, total, span = 1) {
  const start = Math.max(1, page - span)
  const end = Math.min(total, page + span)
  const arr = []
  if (start > 1) arr.push(1)
  if (start === 3) arr.push(2)
  else if (start > 3) arr.push('gap-start')
  for (let i = start; i <= end; i++) arr.push(i)
  if (end === total - 2) arr.push(total - 1)
  else if (end < total - 2) arr.push('gap-end')
  if (end < total) arr.push(total)
  return arr
}

const CATEGORY_DESC = {
  독후감: '책을 읽고 남긴 독후감과 일상의 생각들을 모았습니다.',
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

  const perPage = perPageOf(category)
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
                      {pageWindow(page, totalPages).map((n) =>
                        typeof n === 'string' ? (
                          <li key={n} className="page-item disabled page-gap" aria-hidden="true">
                            <span className="page-link">…</span>
                          </li>
                        ) : (
                          <li key={n} className={`page-item${n === page ? ' active' : ''}`}>
                            <button className="page-link" onClick={() => goPage(n)}>
                              {n}
                            </button>
                          </li>
                        ),
                      )}
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
