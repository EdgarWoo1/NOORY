import { Link } from 'react-router-dom'

// 콘텐츠 페이지 상단의 녹색 헤더 배너 (제목 + 브레드크럼).
export default function PageHeader({ title, crumb }) {
  return (
    <div className="container-fluid page-header">
      <div className="container">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: 400 }}
        >
          <h3 className="display-4 text-white text-uppercase">{title}</h3>
          <div className="d-inline-flex text-white">
            <p className="m-0 text-uppercase">
              <Link className="text-white" to="/">
                홈 바로가기
              </Link>
            </p>
            <i className="fa fa-angle-double-right pt-1 px-3"></i>
            <p className="m-0 text-uppercase">{crumb || title}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
