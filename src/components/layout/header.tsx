import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './header.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface JwtPayload {
    Email: string;
    DisplayName: string;
    UserId: string;
    UserName: string;
    UserRole: string;
    nbf: number;
    exp: number;
    iat: number;
}

interface User {
    name: string;
    role: string;
}

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            try {
                const decoded: JwtPayload = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    localStorage.removeItem("accessToken");
                    setIsAuthenticated(false);
                } else {
                    setUser({ 
                        name: decoded.DisplayName, 
                        role: decoded.UserRole 
                    });
                    setIsAuthenticated(true);
                    
                }
            } catch (err) {
                console.error("Token không hợp lệ:", err);
                setIsAuthenticated(false);
            }
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial scroll position
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("idtoken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        navigate("/dang-nhap")
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <Link to="/" className="navbar-brand d-flex align-items-center">
                        <div className="d-flex align-items-center">
                            <img src="./img/logo-roomnear.png" alt="RoomNear" style={{ width: '50px', height: '50px' }} />
                            <span className="fw-bold fs-4 ms-2">
                                ROOM<span>NEAR</span>
                            </span>
                        </div>
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-controls="navbarNav"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link to="/" className="nav-link px-3">Trang chủ</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/tim-tro" className="nav-link px-3">Tìm trọ</Link>
                            </li>
                            
                            <li className="nav-item">
                                <Link to="/chu-ho" className="nav-link px-3">Chủ hộ</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/lien-he" className="nav-link px-3">Liên hệ</Link>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/dang-ky" className="btn btn-outline-primary me-2">Đăng ký</Link>
                                    <Link to="/dang-nhap" className="btn btn-primary">Đăng nhập</Link>
                                </>
                            ) : (
                                <div className={`dropdown ${isDropdownOpen ? 'show' : ''}`}>
                                    <button
                                        className="btn btn-link dropdown-toggle text-decoration-none d-flex align-items-center"
                                        type="button"
                                        onClick={toggleDropdown}
                                        aria-expanded={isDropdownOpen}
                                    >
                                        <span>{user?.name || 'Tài khoản'}</span>
                                    </button>
                                    <ul className={`dropdown-menu dropdown-menu-end shadow ${isDropdownOpen ? 'show' : ''}`}>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><Link to="/ho-so" className="dropdown-item"><i className="fas fa-user me-2"></i>Hồ sơ cá nhân</Link></li>
                                        <li><Link to="/phong-da-dang" className="dropdown-item"><i className="fas fa-list me-2"></i>Phòng đã đăng</Link></li>
                                        <li><Link to="/thanh-toan" className="dropdown-item"><i className="fas fa-heart me-2"></i>Trở chủ hộ</Link></li>
                                        {user?.role === "Admin" ? (
                                            <li>
                                                <Link to="/admin" className="dropdown-item">
                                                    <i className="fas fa-tools me-2"></i>Trang quản trị
                                                </Link>
                                            </li>
                                        ) : (
                                            <li>
                                                <Link to="/lich-su-thanh-toan" className="dropdown-item">
                                                    <i className="fas fa-bell me-2"></i>Lịch sử thanh toán
                                                </Link>
                                            </li>
                                        )}
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><Link to="/cai-dat" className="dropdown-item"><i className="fas fa-cog me-2"></i>Cài đặt</Link></li>
                                        <li>
                                            <button onClick={handleLogout} className="dropdown-item text-danger">
                                                <i className="fas fa-sign-out-alt me-2"></i>Đăng xuất
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
