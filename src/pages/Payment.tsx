import axios from 'axios';
import styled from 'styled-components';

const PaymentContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  padding-top: 100px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 40px;
`;

const PackagesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const Package = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const Price = styled.div`
  font-size: 18px;
  color: #0066cc;
  margin: 10px 0;
  font-weight: bold;
`;

const PackageTitle = styled.h2`
  font-size: 18px;
  margin: 10px 0;
`;

const Feature = styled.div`
  margin: 5px 0;
  font-size: 14px;
  color: #444;
`;

const RegisterButton = styled.button`
  background: #0066cc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: auto;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 14px;

  &:hover {
    background: #0052a3;
  }
`;

const API_URL = import.meta.env.VITE_API_URL;

const handleRegister = async (planID : number) => {
  try {
    const token = localStorage.getItem("accessToken"); // Lấy token từ localStorage
    const response = await axios.post(
      `${API_URL}/api/Subscription/Choose-Sub`,
      {
        planId: planID ,
        returnUrl: "http://localhost:5173/thanh-toan-thanh-cong", 
        cancelUrl: "http://localhost:5173/payment",   // Trang nếu hủy thanh toán
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;
    console.log(data)
    window.location.href =data;
  } catch (error) {
    console.error("Lỗi khi gọi API thanh toán:", error);
  }
};

const Payment = () => {
  return (
    <PaymentContainer>
      <Title>CÁC GÓI ĐĂNG KÝ CHỦ HỘ</Title>
      <Subtitle>Some of our powerful program can save you so much</Subtitle>

      <PackagesContainer>
        <Package >
          <PackageTitle>GÓI Pro</PackageTitle>
          <Price>50.000/tuần</Price>
          <Feature>Thời gian phổ biến</Feature>
          <Feature>Có thể đăng tối đa 4 phòng trọ</Feature>
          <Feature>Hiệu lực 7 ngày</Feature>
          <RegisterButton onClick={() => handleRegister(1)}>ĐĂNG KÝ</RegisterButton>

        </Package>

        <Package>
          <PackageTitle>GÓI Premium</PackageTitle>
          <Price>100.000 VND/tháng</Price>
          <Feature>Thời gian phổ biến</Feature>
          <Feature>Có thể đăng tối đa 10 phòng trọ</Feature>
          <Feature>Hiệu lực 30 ngày</Feature>
          <RegisterButton onClick={() => handleRegister(2)}>ĐĂNG KÝ</RegisterButton>

        </Package>

        <Package style={{ position: 'relative' }}>
          <span className="recommend-tag">KHUYÊN DÙNG</span>
          <PackageTitle>GÓI Ultra</PackageTitle>
          <Price>1.000.000 VND/năm</Price>
          <Feature>Thời gian phổ biến</Feature>
          <Feature>không giới hạn số lượng phòng trọ đăng</Feature>
          <Feature>Hiệu lực 1 năm</Feature>
          <RegisterButton onClick={() => handleRegister(3)}>ĐĂNG KÝ</RegisterButton>
        </Package>
      </PackagesContainer>
    </PaymentContainer>
  );
};

export default Payment;
