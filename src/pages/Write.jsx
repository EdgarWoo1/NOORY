import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createPost, getBySlug, updatePost } from '../lib/postsApi'
import { CATEGORIES } from '../data/posts'
import PageHeader from '../components/PageHeader'

function makeSlug(title) {
  const ascii = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const id = Date.now().toString(36)
  return ascii ? `${ascii}-${id}` : `post-${id}`
}

export default function Write() {
  const { slug } = useParams()
  const editing = Boolean(slug)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[1]) // 기본: 일기
  const [tag, setTag] = useState('')
  const [thumb, setThumb] = useState('')
  const [body, setBody] = useState('')

  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!editing) return
    let active = true
    getBySlug(slug).then((p) => {
      if (!active) return
      if (!p || p.source !== 'db') {
        setNotFound(true)
      } else {
        setTitle(p.title)
        setCategory(p.category)
        setTag(p.tag || '')
        setThumb(p.thumb || '')
        setBody(p.body || '')
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug, editing])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updatePost(slug, {
          title: title.trim(),
          category,
          tag: tag.trim(),
          thumb: thumb.trim(),
          body: body.trim(),
        })
        navigate(`/post/${encodeURIComponent(slug)}`)
      } else {
        const newSlug = makeSlug(title)
        const today = new Date().toISOString().slice(0, 10)
        await createPost({
          slug: newSlug,
          title: title.trim(),
          category,
          tag: tag.trim(),
          thumb: thumb.trim(),
          date: today,
          body: body.trim(),
        })
        navigate(`/post/${encodeURIComponent(newSlug)}`)
      }
    } catch (err) {
      setError((editing ? '수정' : '저장') + '에 실패했어요: ' + err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 400 }}>
        <p className="py-5 text-muted">불러오는 중…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: 400 }}>
        <h1 className="py-4">수정할 글을 찾을 수 없어요</h1>
        <Link to="/" className="btn btn-primary">
          홈으로
        </Link>
      </div>
    )
  }

  const canSubmit = title.trim() && body.trim() && !saving

  return (
    <>
      <PageHeader title={editing ? '글 수정' : '글쓰기'} crumb="글쓰기" />
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label>제목</label>
                  <input
                    className="form-control p-4"
                    type="text"
                    placeholder="제목"
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group mb-3" style={{ flex: 1 }}>
                    <label>카테고리</label>
                    <select
                      className="form-control p-2"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-3" style={{ flex: 2 }}>
                    <label>
                      태그 <small className="text-muted">(선택)</small>
                    </label>
                    <input
                      className="form-control p-2"
                      type="text"
                      placeholder="예: #독후감, 에세이"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label>
                    대표 이미지 주소{' '}
                    <small className="text-muted">(선택, 비우면 기본 이미지)</small>
                  </label>
                  <input
                    className="form-control p-2"
                    type="text"
                    placeholder="https://… 또는 /img/…"
                    value={thumb}
                    onChange={(e) => setThumb(e.target.value)}
                  />
                </div>

                <div className="form-group mb-3">
                  <label>
                    본문 <small className="text-muted">(빈 줄로 문단 구분)</small>
                  </label>
                  <textarea
                    className="form-control p-3"
                    rows={14}
                    placeholder="내용을 입력하세요…"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                {error && <p className="text-danger">{error}</p>}

                <div className="d-flex justify-content-end" style={{ gap: 10 }}>
                  <Link
                    to={editing ? `/post/${encodeURIComponent(slug)}` : '/'}
                    className="btn btn-outline-secondary px-4"
                  >
                    취소
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={!canSubmit}
                  >
                    {saving ? '저장 중…' : editing ? '수정 완료' : '글 발행'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
