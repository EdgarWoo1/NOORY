import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
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
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<List category="일기" />} />
        <Route path="/travel" element={<List category="여행기" />} />
        <Route path="/diary" element={<List category="일기" />} />
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
    </Layout>
  )
}
