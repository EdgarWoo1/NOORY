import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../auth'

const YOUTUBE = 'https://www.youtube.com/channel/UC_2QQ0r2GLkwYMlfS8_3o4w'

export default function Layout({ children }) {
  const { isAuthed } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false) // 모바일 메뉴 토글
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut()
    navigate('/')
  }

  const closeMenu = () => setOpen(false)

  return (
    <>
      {/* Topbar */}
      <div className="container-fluid bg-light pt-3 d-none d-lg-block">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 text-center text-lg-left mb-2 mb-lg-0">
              <div className="d-inline-flex align-items-center">
                <p>
                  <i className="fa fa-envelope mr-2"></i>wsh130@naver.com
                </p>
                <p className="text-body px-3">|</p>
                <p>세계일주를 꿈꾸는 20대 청년의 이야기</p>
              </div>
            </div>
            <div className="col-lg-6 text-center text-lg-right">
              <div className="d-inline-flex align-items-center">
                <Link className="text-primary pl-3" to="/search" title="검색">
                  <i className="fa fa-search"></i>
                </Link>
                <a className="text-primary pl-3" href={YOUTUBE} target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="container-fluid position-relative nav-bar p-0">
        <div
          className="container-lg position-relative p-0 px-lg-3"
          style={{ zIndex: 9 }}
        >
          <nav className="navbar navbar-expand-lg bg-light navbar-light shadow-lg py-3 py-lg-0 pl-3 pl-lg-5">
            <Link to="/" className="navbar-brand" onClick={closeMenu}>
              <h1 className="m-0 text-primary">
                <span className="text-dark">NOORY</span>
              </h1>
            </Link>
            <button
              type="button"
              className="navbar-toggler"
              onClick={() => setOpen((o) => !o)}
              aria-label="메뉴"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className={`collapse navbar-collapse justify-content-between px-3${
                open ? ' show' : ''
              }`}
            >
              <div className="navbar-nav ml-auto py-0 align-items-lg-center">
                <NavLink to="/" end className="nav-item nav-link" onClick={closeMenu}>
                  홈 바로가기
                </NavLink>
                <NavLink to="/travel" className="nav-item nav-link" onClick={closeMenu}>
                  여행기
                </NavLink>
                <NavLink to="/diary" className="nav-item nav-link" onClick={closeMenu}>
                  일기
                </NavLink>
                {isAuthed && (
                  <NavLink to="/write" className="nav-item nav-link" onClick={closeMenu}>
                    글쓰기
                  </NavLink>
                )}
                {/* 검색: 모바일에서만 메뉴에 노출 (데스크톱은 상단바에 있음) */}
                <NavLink
                  to="/search"
                  className="nav-item nav-link d-lg-none"
                  onClick={closeMenu}
                >
                  <i className="fa fa-search mr-1"></i>검색
                </NavLink>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="footer bg-dark text-white-50 mt-5">
        <div className="container pt-5 pb-4">
          <div className="row">
            {/* Brand */}
            <div className="col-md-5 mb-4 mb-md-0">
              <Link to="/" className="navbar-brand d-inline-block mb-2">
                <h1 className="text-primary m-0">
                  <span className="text-white">NOORY</span>
                </h1>
              </Link>
              <p className="mb-3">세계일주를 꿈꾸는 20대 청년의 이야기.</p>
              <a
                className="btn btn-outline-primary btn-square"
                href={YOUTUBE}
                target="_blank"
                rel="noreferrer"
                aria-label="유튜브"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>

            {/* 메뉴 */}
            <div className="col-6 col-md-3 mb-4 mb-md-0">
              <h6 className="text-white text-uppercase mb-3" style={{ letterSpacing: 3 }}>
                메뉴
              </h6>
              <div className="d-flex flex-column">
                <Link className="footer-link mb-2" to="/travel">
                  여행기
                </Link>
                <Link className="footer-link mb-2" to="/diary">
                  일기
                </Link>
                <Link className="footer-link mb-2" to="/search">
                  검색
                </Link>
                <Link className="footer-link" to="/contact">
                  문의하기
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="col-6 col-md-4">
              <h6 className="text-white text-uppercase mb-3" style={{ letterSpacing: 3 }}>
                Contact
              </h6>
              <p className="mb-2">
                <i className="fa fa-envelope mr-2"></i>wsh130@naver.com
              </p>
              <p className="mb-0">
                <i className="fa fa-map-marker-alt mr-2"></i>서울특별시
              </p>
            </div>
          </div>

          {/* 하단 바: 저작권 + 관리자(구석) */}
          <div className="footer-bottom d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4 pt-3">
            <small>© {new Date().getFullYear()} NOORY · 누리일주</small>
            <small>
              {isAuthed ? (
                <>
                  <Link className="footer-link" to="/write">
                    글쓰기
                  </Link>
                  <span className="px-2">·</span>
                  <button
                    type="button"
                    className="btn btn-link footer-link p-0 align-baseline"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link className="footer-link" to="/login">
                  관리자 로그인
                </Link>
              )}
            </small>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      {showTop && (
        <button
          type="button"
          className="btn btn-primary back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로"
        >
          <i className="fa fa-angle-double-up"></i>
        </button>
      )}
    </>
  )
}
