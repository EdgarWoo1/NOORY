import { Link } from 'react-router-dom'

// 콘텐츠 페이지 상단의 녹색 헤더 배너 (제목 + 브레드크럼).
// compact: 모바일에서 배너 높이를 줄여 본문이 첫 화면에 보이게 한다(상세글용). 데스크톱은 그대로.
export default function PageHeader({ title, crumb, compact = false }) {
  return (
    <div className={`container-fluid page-header${compact ? ' page-header--compact' : ''}`}>
      <div className="container">
        <div className="page-header-inner d-flex flex-column align-items-center justify-content-center">
          <h3 className="display-4 text-white text-uppercase">{title}</h3>
          <div className="d-inline-flex text-white">
            <p className="m-0 text-uppercase">
              <Link className="text-white" to="/">
                홈
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
