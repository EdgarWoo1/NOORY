import { useEffect, useState } from 'react'
import {
  listComments,
  addComment,
  deleteComment,
  commentsEnabled,
} from '../lib/commentsApi'
import { useAuth } from '../auth'

function formatWhen(iso) {
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`
}

export default function Comments({ postSlug }) {
  const { isAuthed } = useAuth()
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const enabled = commentsEnabled()

  async function load() {
    setLoading(true)
    setComments(await listComments(postSlug))
    setLoading(false)
  }

  useEffect(() => {
    if (enabled) load()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await addComment(postSlug, name.trim(), body.trim())
      setBody('')
      await load()
    } catch (err) {
      setError('댓글 등록에 실패했어요: ' + err.message)
    }
    setSubmitting(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    try {
      await deleteComment(id)
      await load()
    } catch (err) {
      window.alert('삭제에 실패했어요: ' + err.message)
    }
  }

  return (
    <div className="mt-5 pt-4" style={{ borderTop: '1px solid #eee' }}>
      <h4 className="mb-4">
        댓글{comments.length > 0 && ` (${comments.length})`}
      </h4>

      {!enabled ? (
        <p className="text-muted">댓글 기능을 사용하려면 Supabase 설정이 필요해요.</p>
      ) : (
        <>
          {loading ? (
            <p className="text-muted">댓글을 불러오는 중…</p>
          ) : comments.length === 0 ? (
            <p className="text-muted">아직 댓글이 없어요. 첫 댓글을 남겨 보세요!</p>
          ) : (
            <ul className="list-unstyled mb-4">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="bg-white p-3 mb-2"
                  style={{ border: '1px solid #eee', borderRadius: 6 }}
                >
                  <div className="d-flex justify-content-between align-items-baseline mb-1">
                    <strong className="text-primary">{c.name}</strong>
                    <small className="text-muted">
                      {formatWhen(c.createdAt)}
                      {isAuthed && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-danger p-0 ml-2"
                          onClick={() => handleDelete(c.id)}
                        >
                          삭제
                        </button>
                      )}
                    </small>
                  </div>
                  <p className="m-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="이름"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ maxWidth: 220 }}
              />
            </div>
            <div className="form-group mb-2">
              <textarea
                className="form-control"
                rows={3}
                placeholder="따뜻한 댓글을 남겨 주세요 :)"
                maxLength={1000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              ></textarea>
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={submitting || !name.trim() || !body.trim()}
            >
              {submitting ? '등록 중…' : '댓글 남기기'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
