import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAll } from '../lib/postsApi'
import PostCard from '../components/PostCard'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    listAll().then((data) => {
      if (!active) return
      setPosts(data.slice(0, 6))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* Hero */}
      <div className="container-fluid p-0">
        <div className="hero-banner d-flex flex-column align-items-center justify-content-center text-center">
          <div className="p-3" style={{ maxWidth: 900 }}>
            <h4 className="text-white text-uppercase mb-md-3">Tours &amp; Travel</h4>
            <h1 className="display-3 text-white mb-md-4">
              Let's Discover The World Together
            </h1>
            <Link to="/travel" className="btn btn-primary py-md-3 px-md-5 mt-2">
              #여행기 보러가기
            </Link>
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div className="container-fluid py-5">
        <div className="container pt-5 pb-3">
          <div className="text-center mb-3 pb-3">
            <h6 className="text-primary text-uppercase" style={{ letterSpacing: 5 }}>
              Our Blog
            </h6>
            <h1>최근 게시글</h1>
          </div>
          {loading ? (
            <p className="text-center text-muted py-5">불러오는 중…</p>
          ) : (
            <div className="row pb-3">
              {posts.map((post) => (
                <div key={post.slug} className="col-lg-4 col-md-6 mb-4 pb-2">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
          <div className="text-center">
            <Link to="/diary" className="btn btn-outline-primary px-4 mr-2">
              일기 더보기
            </Link>
            <Link to="/travel" className="btn btn-outline-primary px-4">
              여행기 더보기
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
