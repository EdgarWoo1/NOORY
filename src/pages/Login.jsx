import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { isSupabaseConfigured } from '../config'
import { useAuth } from '../auth'
import PageHeader from '../components/PageHeader'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthed } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from || '/write'

  if (isAuthed) return <Navigate to={from} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      setError('로그인에 실패했어요: ' + error.message)
      setSubmitting(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <>
      <PageHeader title="관리자 로그인" crumb="로그인" />
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-5">
              {!isSupabaseConfigured() ? (
                <div className="alert alert-warning">
                  로그인 기능을 쓰려면 <code>src/config.js</code>의 Supabase 설정이
                  필요해요.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label>이메일</label>
                    <input
                      type="email"
                      className="form-control p-4"
                      autoComplete="username"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      className="form-control p-4"
                      autoComplete="current-password"
                      placeholder="비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-danger">{error}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary btn-block py-3"
                    disabled={submitting || !email.trim() || !password}
                  >
                    {submitting ? '로그인 중…' : '로그인'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
