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
                <NavLink to="/search" className="nav-item nav-link" onClick={closeMenu}>
                  <i className="fa fa-search mr-1"></i>검색
                </NavLink>
                {isAuthed && (
                  <NavLink to="/write" className="nav-item nav-link" onClick={closeMenu}>
                    글쓰기
                  </NavLink>
                )}
                {isAuthed ? (
                  <button
                    type="button"
                    className="nav-item nav-link btn btn-link p-0 px-lg-2 text-left"
                    onClick={() => {
                      closeMenu()
                      handleLogout()
                    }}
                  >
                    로그아웃
                  </button>
                ) : (
                  <NavLink to="/login" className="nav-item nav-link" onClick={closeMenu}>
                    로그인
                  </NavLink>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <div
        className="container-fluid bg-dark text-white-50 py-5 px-sm-3 px-lg-5"
        style={{ marginTop: 90 }}
      >
        <div className="row pt-5">
          <div className="col-lg-3 col-md-6 mb-5">
            <Link to="/" className="navbar-brand">
              <h1 className="text-primary">
                <span className="text-white">NOORY</span>
              </h1>
            </Link>
            <p>세계일주를 꿈꾸는 20대 청년의 이야기입니다.</p>
            <h6
              className="text-white text-uppercase mt-4 mb-3"
              style={{ letterSpacing: 5 }}
            >
              Follow Us
            </h6>
            <div className="d-flex justify-content-start">
              <a className="btn btn-outline-primary btn-square" href={YOUTUBE} target="_blank" rel="noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h5 className="text-white text-uppercase mb-4" style={{ letterSpacing: 5 }}>
              메뉴
            </h5>
            <div className="d-flex flex-column justify-content-start">
              <Link className="text-white-50 mb-2" to="/travel">
                <i className="fa fa-angle-right mr-2"></i>여행기
              </Link>
              <Link className="text-white-50 mb-2" to="/diary">
                <i className="fa fa-angle-right mr-2"></i>일기
              </Link>
              <Link className="text-white-50 mb-2" to="/search">
                <i className="fa fa-angle-right mr-2"></i>검색
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-5"></div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h5 className="text-white text-uppercase mb-4" style={{ letterSpacing: 5 }}>
              Contact Us
            </h5>
            <p>
              <i className="fa fa-map-marker-alt mr-2"></i>서울특별시
            </p>
            <p>
              <i className="fa fa-envelope mr-2"></i>wsh130@naver.com
            </p>
            <Link to="/contact" className="btn btn-primary mt-2">
              문의하기
            </Link>
          </div>
        </div>
      </div>

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
