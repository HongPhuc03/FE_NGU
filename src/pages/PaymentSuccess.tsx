import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');
    const token = localStorage.getItem('accessToken');
    console.log(token)
  
    if (!token) {
      navigate('/login');
      return;
    }
  
    const handlePaymentSuccess = async () => {
      try {
        const response = await axios.get(`https://localhost:7135/api/Subscription/success?orderCode=${orderCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (response.status === 200) {
          setMessage({ type: 'success', text: 'Thanh toán thành công! Đang chuyển hướng...' });
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xác nhận thanh toán' });
      }
    };
  
    if (orderCode && status === 'PAID' && cancel === 'false') {
      handlePaymentSuccess();
    } else if (status === 'CANCELED' || cancel === 'true') {
      setMessage({ type: 'error', text: 'Bạn đã hủy giao dịch hoặc thanh toán không thành công.' });
    }
  }, [orderCode, navigate, searchParams]);
  

  return (
    <div style={{paddingTop: '80px'}}>
      <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-4 text-center">
              {message.type === 'success' ? (
                <>
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="mb-3">Thanh toán thành công!</h2>
                  <p className="text-muted">Cảm ơn bạn đã đăng ký gói dịch vụ của chúng tôi.</p>
                </>
              ) : message.type === 'error' ? (
                <>
                  <div className="mb-4">
                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="mb-3">Có lỗi xảy ra</h2>
                  <p className="text-muted">{message.text}</p>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <h2 className="mb-3">Đang xử lý...</h2>
                  <p className="text-muted">Vui lòng đợi trong giây lát</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PaymentSuccess; 