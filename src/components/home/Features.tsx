const Features = () => {
    return (
        <section className="features py-5" style={{ backgroundColor: '#EBF3FF' }}>
            <div className="container">
                <div className="row">
                    <div className="col-12 text-center mb-5">
                        <h2 className="fw-bold">Cộng đồng dành cho sinh viên</h2>
                        <p className="text-muted">Mua bán đồ cũ và giải quyết vấn đề cho sinh viên</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="features-slider overflow-hidden position-relative">
                            <div className="d-flex flex-nowrap" style={{ animation: 'slide 20s linear infinite' }}>
                                <div className="feature-card flex-shrink-0 mx-3" style={{ width: '300px' }}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <i className="bi bi-shop text-primary fs-2"></i>
                                            </div>
                                            <h3 className="h5 mb-3">Mua bán đồ cũ</h3>
                                            <p className="text-muted mb-0">Mở rộng cửa cuộc sống, giúp bạn có thể mua bán đồ cũ và bảo hiểm cho cuộc sống tốt hơn.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="feature-card flex-shrink-0 mx-3" style={{ width: '300px' }}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <i className="bi bi-people text-primary fs-2"></i>
                                            </div>
                                            <h3 className="h5 mb-3">Mạng xã hội</h3>
                                            <p className="text-muted mb-0">Nơi mà sinh viên có thể chia sẻ, trò chuyện và kết nối với những người xung quanh.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="feature-card flex-shrink-0 mx-3" style={{ width: '300px' }}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <i className="bi bi-chat-dots text-primary fs-2"></i>
                                            </div>
                                            <h3 className="h5 mb-3">Hỏi đáp chuyên sinh viên</h3>
                                            <p className="text-muted mb-0">Bạn không còn phải lo lắng về những vấn đề trong cuộc sống với cộng đồng hỗ trợ.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="feature-card flex-shrink-0 mx-3" style={{ width: '300px' }}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="feature-icon mb-3">
                                                <i className="bi bi-building text-primary fs-2"></i>
                                            </div>
                                            <h3 className="h5 mb-3">Cộng đồng cho trường ĐH</h3>
                                            <p className="text-muted mb-0">Có một nơi thực sự dành cho sinh viên, nơi bạn có thể tìm thấy mọi thứ bạn cần.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes slide {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-1200px); /* Adjusted for 4 cards */
                        }
                    }
                    
                    .features-slider {
                        padding: 20px 0;
                    }
                    
                    .feature-card:hover {
                        transform: translateY(-10px);
                        transition: transform 0.3s ease;
                    }
                `}</style>
            </div>
        </section>
    );
};

export default Features;