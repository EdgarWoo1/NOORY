import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import List from './pages/List'
import PostDetail from './pages/PostDetail'
import Search from './pages/Search'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Write from './pages/Write'
import { RequireAuth } from './auth'

// 페이지 이동 시 항상 맨 위로 스크롤
function ScrollToTop() {
  const { pathname } = useLocation()
  // 주의: 화살표 함수의 암묵적 반환을 쓰면 window.scrollTo(...)의 반환값이
  // effect의 cleanup으로 등록된다. 일부 브라우저에서 scrollTo가 함수가 아닌 값
  // (예: Promise)을 돌려주면, 경로 이동 시 React가 그걸 정리 함수로 호출하다
  // "is not a function" 오류로 앱 전체가 죽는다. 반드시 블록 본문으로 감싼다.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <Layout>
      <ScrollToTop />
      {/* 경로가 바뀌면 key가 달라져 boundary가 새로 마운트되며 에러 상태가 초기화된다 */}
      <ErrorBoundary key={pathname}>
        <Routes>
        <Route path="/" element={<List category="일기" />} />
        <Route path="/travel" element={<List category="여행기" />} />
        <Route path="/diary" element={<List category="일기" />} />
        <Route path="/essay" element={<List category="에세이" />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/write"
          element={
            <RequireAuth>
              <Write />
            </RequireAuth>
          }
        />
        <Route
          path="/write/:slug/edit"
          element={
            <RequireAuth>
              <Write />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <div className="container py-5 text-center" style={{ minHeight: 400 }}>
              <h1 className="py-5">페이지를 찾을 수 없어요</h1>
            </div>
          }
        />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}
