import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBySlug, deletePost } from '../lib/postsApi'
import { useAuth } from '../auth'
import PageHeader from '../components/PageHeader'
import Comments from '../components/Comments'

export default function PostDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthed } = useAuth()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getBySlug(slug).then((p) => {
      if (!active) return
      setPost(p)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug])

  async function handleDelete() {
    if (!window.confirm('이 글을 정말 삭제할까요? 되돌릴 수 없어요.')) return
    setDeleting(true)
    try {
      await deletePost(slug)
      navigate(post.category === '여행기' ? '/travel' : '/diary')
    } catch (err) {
      window.alert('삭제에 실패했어요: ' + err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 400 }}>
        <p className="py-5 text-muted">불러오는 중…</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 400 }}>
        <h1 className="py-4">글을 찾을 수 없어요</h1>
        <Link to="/" className="btn btn-primary">
          홈으로
        </Link>
      </div>
    )
  }

  const isDb = post.source === 'db'
  const showCover = post.category === '일기' && post.thumb

  return (
    <>
      <PageHeader title={post.category} crumb={post.category} />
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {/* 메타 */}
              <div className="d-flex mb-3">
                <span className="text-primary text-uppercase">Admin</span>
                <span className="text-primary px-2">|</span>
                <span className="text-primary text-uppercase">
                  {post.tag || post.category}
                </span>
                {post.dateLabel && (
                  <>
                    <span className="text-primary px-2">|</span>
                    <span className="text-muted">{post.dateLabel}</span>
                  </>
                )}
              </div>

              <h2 className="mb-4">{post.title}</h2>

              {/* 책 표지(일기) */}
              {showCover && (
                <div className="text-center mb-4">
                  <img
                    src={post.thumb}
                    alt=""
                    style={{ maxWidth: 300, width: '100%', height: 'auto' }}
                  />
                </div>
              )}

              {/* 본문 */}
              <div className="bg-white post-body" style={{ padding: 20 }}>
                {isDb ? (
                  (post.body || '').split(/\n\s*\n/).map((para, i) => (
                    <p key={i} style={{ whiteSpace: 'pre-wrap' }}>
                      {para}
                    </p>
                  ))
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
                )}
              </div>

              {/* 관리자: 수정/삭제 (DB 글만) */}
              {isAuthed && isDb && (
                <div className="mt-4 d-flex" style={{ gap: 10 }}>
                  <Link
                    to={`/write/${encodeURIComponent(post.slug)}/edit`}
                    className="btn btn-outline-primary"
                  >
                    ✏️ 수정
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    🗑 {deleting ? '삭제 중…' : '삭제'}
                  </button>
                </div>
              )}

              {/* 댓글 */}
              <Comments postSlug={post.slug} />

              <div className="mt-4">
                <Link
                  to={post.category === '여행기' ? '/travel' : '/diary'}
                  className="btn btn-link pl-0"
                >
                  ← 목록으로
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
