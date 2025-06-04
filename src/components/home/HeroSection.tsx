import { Link  } from 'react-router-dom';

const HeroSection = () => {
    

    return (
        <div className="hero-section position-relative w-100" style={{ backgroundImage: 'url("./img/imgLandingPage.png")' }}>
            <div className="hero-overlay position-absolute w-100 h-100" style={{ background: 'rgba(0,0,0,0.5)' }}></div>
            <div className="container-fluid position-relative py-5">
                <div className="row min-vh-75 align-items-center">

                    <div className="col-12 text-center text-white" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(13,110,253,0.8) 100%)', padding: '3rem 0' }}>
                        <div className="d-flex align-items-center justify-content-center">
                            <div className="me-4">
                                <Link to="/" className="d-inline-flex align-items-center">
                                    <div className="d-flex align-items-center">
                                        <img src="./img/logo-roomnear.png" alt="RoomNear" style={{ width: '200px', height: '200px' }} />
                                    </div>
                                </Link>
                            </div>

                            <div>
                                <h1 className="display-4 fw-bold mb-4">Tìm kiếm phòng trọ cho sinh viên</h1>
                                <p className="lead mb-0">Nền tảng tìm kiếm phòng trọ và giải quyết vấn đề cho sinh viên.</p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default HeroSection;