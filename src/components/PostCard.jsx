import { Link } from 'react-router-dom'
import { dateBadge, DEFAULT_THUMB } from '../data/posts'

// 목록/홈에 쓰이는 글 카드 (원본 .blog-item 구조).
export default function PostCard({ post, count = 0 }) {
  const to = `/post/${encodeURIComponent(post.slug)}`
  const badge = dateBadge(post)
  return (
    <div className="blog-item">
      <div className="position-relative">
        <Link to={to}>
          <img
            className="img-fluid w-100"
            src={post.thumb || DEFAULT_THUMB}
            alt=""
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_THUMB
            }}
          />
        </Link>
        {badge && (
          <div className="blog-date">
            <h6 className="font-weight-bold mb-n1">{badge.split('.')[0] || badge}</h6>
            <small className="text-white text-uppercase">{post.category}</small>
          </div>
        )}
        <span className="comment-badge" title={`댓글 ${count}개`}>
          <i className="fa fa-comment mr-1"></i>
          {count}
        </span>
      </div>
      <div className="bg-white p-4">
        <div className="d-flex mb-2">
          <span className="text-primary text-uppercase">Admin</span>
          <span className="text-primary px-2">|</span>
          <span className="text-primary text-uppercase">{post.tag || post.category}</span>
        </div>
        <Link className="h5 m-0 text-decoration-none d-block" to={to}>
          {post.title}
        </Link>
      </div>
    </div>
  )
}
