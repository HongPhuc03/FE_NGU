import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface SubscriptionPlan {
  id: number;
  name: string;
  maxRooms: number;
  duration: number;
  price: number;
}

interface Subscription {
  id: number;
  userId: string;
  subscriptionPlanId: number;
  startDate: string;
  endDate: string;
  subscriptionPlan: SubscriptionPlan;
}

interface UserLocation {
  id: number;
  ing: number;
  lat: number;
}

interface ProfileData {
  id: string;
  displayName: string;
  userName: string;
  email: string;
  password: string;
  isDisabled: boolean;
  number: string;
  address: string;
  role: number;
  avatar: string;
  userRole: number;
  isDisable: boolean;
  numberOfHouse: number;
  userLocation: UserLocation;
  subscription: Subscription;
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    displayName: '',
    userName: '',
    email: '',
    password: '',
    isDisabled: false,
    number: '',
    address: '',
    role: 0,
    avatar: '',
    userRole: 0,
    isDisable: false,
    numberOfHouse: 0,
    userLocation: { id: 0, ing: 0, lat: 0 },
    subscription: { id: 0, userId: '', subscriptionPlanId: 0, startDate: '', endDate: '', subscriptionPlan: { id: 0, name: '', maxRooms: 0, duration: 0, price: 0 } },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('https://localhost:7135/api/User/UserDetail', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setProfileData(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create update data object with empty strings for unfilled fields
      const updateData = {
        displayName: profileData.displayName || '',
        number: profileData.number || '',
        password: profileData.password || '',
        address: profileData.address || ''
      };

      await axios.put('https://localhost:7135/api/User/UpdateUser', updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title mb-0">Hồ sơ cá nhân</h2>
                <button
                  className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="displayName" className="form-label">Tên hiển thị</label>
                  <input
                    type="text"
                    className="form-control"
                    id="displayName"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="userName" className="form-label">Tên đăng nhập</label>
                  <input
                    type="text"
                    className="form-control"
                    id="userName"
                    name="userName"
                    value={profileData.userName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mật khẩu</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={profileData.password}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="number" className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="number"
                    name="number"
                    value={profileData.number}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="08985248955"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3 d-flex align-items-center">
                  <label className="form-label mb-0 me-2">Vai trò:</label>
                  <div className="badge bg-primary fs-6 py-2 px-3">
                    {profileData.userRole === 1 && "Chủ trọ"}
                    {profileData.userRole === 2 && "Người xem trọ"}
                    {profileData.userRole !== 1 && profileData.userRole !== 2 && "Admin"}
                  </div>
                </div>

                {profileData.subscription && (
                  <div className="mb-3">
                    <label className="form-label">Thông tin gói đăng ký:</label>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-2">
                          <strong>Gói đăng ký:</strong> {profileData.subscription.subscriptionPlan.name}
                        </p>
                        <p className="mb-2">
                          <strong>Số phòng đã đăng: </strong> {profileData.numberOfHouse}/{profileData.subscription.subscriptionPlan.maxRooms}
                        </p>
                        <p className="mb-0">
                          <strong>Ngày kết thúc:</strong>{' '}
                          {new Date(profileData.subscription.endDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      Lưu thay đổi
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 