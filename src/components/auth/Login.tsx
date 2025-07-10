import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
    });
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL || 'https://exe-production-f23e.up.railway.app';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            
             const response = await axios.post(`${API_URL}/api/Auth/Login`, formData);
            //const response = await axios.post(`http://localhost:5104/api/Auth/Login`, formData);
            const { accessToken, appUser } = response.data;
            login(accessToken, appUser);
            navigate('/tim-tro');
             window.location.reload();
        } catch (err) {
            console.error('Login failed:', err);
            const axiosError = err as AxiosError<{ message?: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                axiosError.message ||
                'Có lỗi xảy ra khi đăng nhập';
            setError(errorMessage);
            console.error('Error creating room:', errorMessage);
            // Handle error (show message to user)
        }
    };

    const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            console.error('No credential received');
            return;
        }

        const idtoken = credentialResponse.credential;
        try {
            const response = await axios.post(`${API_URL}/api/Auth/Sign-in-google`, { idtoken });
            const { accessToken, appUser } = response.data;
            localStorage.setItem('idtoken', idtoken);
            login(accessToken, appUser);
            navigate('/tim-tro');
            window.location.reload();
        } catch (error) {
            console.error('Google login failed:', error);
            // Handle error (show message to user)
        }
    };

    return (
        <div className="login-page min-vh-100 d-flex align-items-center"
            style={{
                background: 'linear-gradient(180deg, rgba(13,110,253,0.2) 0%, rgba(255,255,255,1) 100%)',
                paddingTop: '76px', // Height of the header
                paddingBottom: '2rem'
            }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="text-center mb-4">
                            <Link to="/" className="text-decoration-none">
                                <h1 className="text-primary h3 mb-4">ROOMNEAR</h1>
                            </Link>
                        </div>
                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        )}
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <h2 className="h4 mb-1">Đăng nhập</h2>
                                    <p className="text-muted small">Chào mừng bạn trở lại</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="text" className="form-label small">Email & UserName</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="userName"
                                            name="userName"
                                            placeholder="Nhập email"
                                            value={formData.userName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <label htmlFor="password" className="form-label small">Mật khẩu</label>
                                            <Link to="/quen-mat-khau" className="text-primary text-decoration-none small">
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            placeholder="Nhập mật khẩu"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary">
                                            Đăng nhập
                                        </button>
                                    </div>
                                </form>

                                <div className="text-center mt-4">
                                    <GoogleOAuthProvider clientId="104873536196-65tbscmmi8qvsgm1ttm3uq5npl33944i.apps.googleusercontent.com">
                                        <GoogleLogin
                                            onSuccess={handleGoogleLogin}
                                            onError={() => console.log('Login Failed')}
                                        />
                                    </GoogleOAuthProvider>
                                </div>

                                <div className="text-center mt-3">
                                    <p className="mb-0">
                                        Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 
