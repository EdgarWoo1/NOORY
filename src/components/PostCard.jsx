import { Link } from 'react-router-dom'
import { DEFAULT_THUMB } from '../data/posts'

// 날짜(ISO 또는 dateLabel) → { day, ym } 로 분해
function badgeParts(post) {
  let d = post.date ? new Date(post.date) : null
  if ((!d || isNaN(d)) && post.dateLabel) {
    // 'YY.MM.DD' 형태 폴백
    const m = post.dateLabel.match(/(\d{2})\.(\d{1,2})\.(\d{1,2})/)
    if (m) d = new Date(`20${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`)
  }
  if (!d || isNaN(d)) return null
  const p = (n) => String(n).padStart(2, '0')
  return { day: p(d.getDate()), ym: `${d.getFullYear()}.${p(d.getMonth() + 1)}` }
}

// 목록/홈에 쓰이는 글 카드 (원본 .blog-item 구조).
export default function PostCard({ post, count = 0 }) {
  const to = `/post/${encodeURIComponent(post.slug)}`
  const badge = badgeParts(post)
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
            <h6 className="font-weight-bold mb-n1">{badge.day}</h6>
            <small className="text-white text-uppercase">{badge.ym}</small>
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
