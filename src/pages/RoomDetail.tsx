import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Fix Leaflet default marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
}); 

L.Marker.prototype.options.icon = DefaultIcon;

interface AbsoluteLocation {
    id: number;
    longitude: number;
    latitude: number;
    houseId: number;
}

interface Room {
    id: number;
    name: string;
    address: string;
    ownerId: string;
    price: number;
    status: number;
    numberOfPeople: number | null;
    area: number | null;
    description: string | null;
    createAt: string;
    rate: number | null;
    location: number;
    absoluteLocation: AbsoluteLocation;
    images: string[];
    appUser: appUser;
    houseImages: HouseImage[];
    
}
interface appUser {
    id: string;
    displayName: string;
    number: string;
    email: string | null;
    avatar: string | null;
    isDisable: boolean;
    role: number;
}

interface HouseImage {
    id: number;
    imageUrl: string;
}

// Modal nhập thông tin cho khách chưa đăng nhập
type EnterInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: { displayName: string; phoneNumber: string }) => void;
};
const EnterInfoModal: React.FC<EnterInfoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nhập thông tin để gửi yêu cầu thuê phòng</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="displayName" className="form-label">Họ tên</label>
              <input
                type="text"
                id="displayName"
                className="form-control"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
              <input
                type="tel"
                id="phoneNumber"
                className="form-control"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSubmit({ displayName, phoneNumber })}
              disabled={!displayName || !phoneNumber}
            >
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEnterInfoModal, setShowEnterInfoModal] = useState(false);

    const getUserFromLocalStorage = () => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    };

    const user1 = getUserFromLocalStorage();

    const handleRentEmail = async (info?: { displayName: string, phoneNumber: string }) => {
        try {
            const displayNameToSend = info?.displayName || user1?.displayName;
            const phoneNumberToSend = info?.phoneNumber || user1?.phoneNumber;
            const response = await axios.post('https://localhost:7135/api/Email/send-mail-rent', {
                userId: room?.appUser?.id,
                diplayName: displayNameToSend,
                phoneNumber: phoneNumberToSend,
            });
            console.log('Email sent successfully:', response.data);
            toast.success('Đã gửi yêu cầu thuê phòng thành công!');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7135/api/House/GetHouseById?id=${id}`);
                const data = await response.data;
                setRoom(data);
                setLoading(false);
                console.log('Room details fetched successfully:', data);
            } catch (error) {
                console.error('Error fetching room details:', error);
                setLoading(false);
            }
        };
        fetchRoomDetails();
    }, [id]);


    // Thay đổi nút Thuê ngay:
    // Nếu chưa đăng nhập, mở modal nhập info, nếu đã đăng nhập thì gửi mail luôn
    const handleRentClick = () => {
        if (!user1) {
            setShowEnterInfoModal(true);
        } else {
            handleRentEmail();
        }
    };

    if (loading || !room) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    const defaultImage = '/img/imgLandingPage.png';
    const mainImage = room?.houseImages && room.houseImages.length > 0 ? room.houseImages[0].imageUrl : defaultImage;
    const additionalImages = room?.houseImages && room.houseImages.length > 1 ? room.houseImages.slice(1, 4).map((image: HouseImage) => image.imageUrl) : [];

    return (
        <div className="container py-5">
            <div 
                className="room-detail-container min-vh-100"
                style={{
                    backgroundImage: 'url("/img/backgroundRoomDetail.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: 'rgba(241, 245, 249, 0.9)',
                    backgroundBlendMode: 'overlay',
                    paddingTop: '80px'
                }}
            >
                <div className="position-relative" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
                    {/* Thư viện ảnh chính */}
                    <div className="position-relative mb-3">
                        {/* Nhãn giá */}
                        <div className="position-absolute start-0 top-0 m-3 z-1">
                            <div className="bg-white rounded-pill d-flex align-items-center p-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <div className="bg-primary rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                    <i className="bi bi-camera-video fs-6 text-white"></i>
                                </div>
                                <div>
                                    <div className="text-primary small" style={{ fontSize: '12px' }}>Còn trống {room.numberOfPeople} người</div>
                                    <div className="fw-bold" style={{ fontSize: '14px', color: '#2F80ED' }}>{room.price.toLocaleString()} VNĐ<span style={{ fontSize: '12px' }}>/tháng</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Thư viện ảnh */}
                        <div className="container-fluid px-0">
                            <div className="row g-2">
                                <div className="col-12 col-md-8">
                                    <img src={mainImage} alt="Ảnh chính" className="w-100" style={{ height: '350px', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                                <div className="col-md-4 d-none d-md-block">
                                    <div className="row g-2">
                                        {additionalImages.map((image, index) => (
                                            <div key={index} className="col-12">
                                                <img src={image} alt={`Ảnh phòng ${index + 2}`} className="w-100" style={{ height: '114px', objectFit: 'cover', borderRadius: '8px' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin phòng */}
                        <div className="position-absolute bottom-0 start-0 m-3">
                            <div className="bg-white rounded-3 p-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <i className="bi bi-house-door fs-5 text-white"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold text-primary" style={{ fontSize: '16px' }}>{room.name}</h5>
                                        <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>{room.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-8">
                            {/* Bản đồ và nút hành động */}
                            <div className="position-relative">
                                <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                                    <MapContainer
                                        center={[room.absoluteLocation.latitude, room.absoluteLocation.longitude]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[room.absoluteLocation.latitude, room.absoluteLocation.longitude]}>
                                            <Popup>{room.address}</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between">
                                    <button className="btn btn-primary px-3 py-1 fw-bold" style={{ fontSize: '14px' }} onClick={handleRentClick}>
                                        THUÊ NGAY
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                    <button className="btn btn-light px-3 py-1 fw-bold" style={{ fontSize: '14px' }}>
                                        BẢN ĐỒ
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            {/* Mô tả */}
                            <div className="bg-primary rounded-3 p-3 mb-3 text-white">
                                <div className="d-flex align-items-center mb-2">
                                    <div className="bg-white rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <i className="bi bi-file-text text-primary fs-6"></i>
                                    </div>
                                    <h6 className="mb-0 fw-bold">MÔ TẢ CHUNG</h6>
                                </div>
                                <p className="mb-0" style={{ fontSize: '14px', lineHeight: '1.6' }}>{room.description}</p>
                            </div>

                            {/* Liên hệ */}
                            <div className="bg-white rounded-3 p-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src={'/img/imgLandingPage.png'}
                                        alt={'cc'}
                                        className="rounded-circle me-2"
                                        width="48"
                                        height="48"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h6 className="mb-1 fw-bold">{room.name}</h6>
                                        <div className="ext-primary fw-bold" style={{ fontSize: '20px' }}>
                                            {room.appUser.displayName}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <h6 className="mb-0 me-2 fw-bold" style={{ fontSize: '14px' }}>SĐT:</h6>
                                        <span className="text-primary fw-bold" style={{ fontSize: '14px' }}>{room.appUser.number}</span>
                                    </div>
                                </div>
                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-outline-primary py-2 fw-bold" 
                                        style={{ fontSize: '14px' }}
                                    >
                                        <i className="bi bi-chat-dots me-2"></i>
                                        NHẮN TIN
                                    </button>
                                    <button onClick={handleRentClick} className="btn btn-primary py-2 fw-bold" style={{ fontSize: '14px' }}>
                                        THUÊ NGAY
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EnterInfoModal
                isOpen={showEnterInfoModal}
                onClose={() => setShowEnterInfoModal(false)}
                onSubmit={(info: { displayName: string; phoneNumber: string }) => {
                    setShowEnterInfoModal(false);
                    handleRentEmail(info);
                }}
            />
            <ToastContainer />
        </div>
    );
};

export default RoomDetail;