// 렌더링 중 예외가 나도 앱 전체가 하얀 빈 화면으로 죽지 않도록 막는 안전망.
// App.jsx에서 현재 경로(pathname)를 key로 넘겨, 페이지를 이동하면 boundary가
// 새로 마운트되며 에러 상태가 자동으로 초기화된다.
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // 개발/운영 콘솔에 원인을 남겨 둔다.
    console.error('[ErrorBoundary] 렌더링 중 오류', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center" style={{ minHeight: 400 }}>
          <h1 className="py-4">화면을 여는 중 문제가 생겼어요</h1>
          <p className="text-muted mb-4">잠시 후 다시 시도해 주세요.</p>
          <div className="d-flex justify-content-center" style={{ gap: 10 }}>
            <a href="/" className="btn btn-primary">
              홈으로
            </a>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
