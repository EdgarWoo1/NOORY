import { useState } from 'react'
import { supabase } from '../supabase'
import { isSupabaseConfigured } from '../config'
import PageHeader from '../components/PageHeader'

const ADMIN_EMAIL = 'wsh130@naver.com'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const configured = isSupabaseConfigured()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    // Supabase가 있으면 DB에 저장, 없으면 메일 클라이언트로 폴백
    if (!configured || !supabase) {
      const subject = encodeURIComponent(`[누리일주 문의] ${name.trim()}`)
      const bodyText = encodeURIComponent(
        `이름: ${name}\n이메일: ${email}\n\n${message}`,
      )
      window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${bodyText}`
      return
    }

    setSubmitting(true)
    setError('')
    const { error } = await supabase.from('_TdaContact').insert({
      Name: name.trim(),
      Email: email.trim(),
      Message: message.trim(),
    })
    if (error) {
      setError('전송에 실패했어요: ' + error.message)
      setSubmitting(false)
    } else {
      setDone(true)
    }
  }

  return (
    <>
      <PageHeader title="문의하기" crumb="문의" />
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="text-center mb-4">
                <p className="text-muted">
                  궁금한 점이나 하고 싶은 말을 남겨 주세요.
                </p>
                <p>
                  <i className="fa fa-envelope text-primary mr-2"></i>
                  {ADMIN_EMAIL}
                </p>
              </div>

              {done ? (
                <div className="alert alert-success text-center">
                  문의가 정상적으로 전송되었어요. 감사합니다!
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <input
                      type="text"
                      className="form-control p-4"
                      placeholder="이름"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <input
                      type="email"
                      className="form-control p-4"
                      placeholder="이메일 (답장 받을 주소)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <textarea
                      className="form-control p-3"
                      rows={6}
                      placeholder="내용을 입력하세요…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>
                  {error && <p className="text-danger">{error}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary btn-block py-3"
                    disabled={submitting || !name.trim() || !message.trim()}
                  >
                    {submitting ? '전송 중…' : '문의 보내기'}
                  </button>
                  {!configured && (
                    <p className="text-muted small mt-2 text-center">
                      ※ 현재는 메일 앱으로 연결됩니다. (Supabase 연결 시 바로 접수)
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
