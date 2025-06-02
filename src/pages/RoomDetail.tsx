import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
    latitude: number;
    longitude: number;
}

interface AppUser {
    id: string;
    displayName: string;
    number: string;
    email: string | null;
    avatar: string | null;
    isDisable: boolean;
}

// Thêm interface cho houseImages
interface HouseImage {
    id: number;
    imageUrl: string;
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
    images?: string[];
    houseImages: HouseImage[];
    appUser: AppUser;
}

const RoomDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Default center coordinates (Da Nang)
    const defaultCenter: [number, number] = [16.047079, 108.206230];

    // Get valid map center coordinates
    const getMapCenter = (room: Room | null): [number, number] => {
        if (!room?.absoluteLocation) return defaultCenter;
        
        const { latitude, longitude } = room.absoluteLocation;
        
        if (typeof latitude === 'number' && !isNaN(latitude) &&
            typeof longitude === 'number' && !isNaN(longitude)) {
            return [latitude, longitude];
        }
        
        return defaultCenter;
    };

    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                const response = await axios.get(`https://localhost:7135/api/House/GetHouseById?id=${id}`);
                if (!response.data) {
                    throw new Error('No data received from server');
                }
                setRoom(response.data);
                console.log(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching room details:', error);
                setError(error instanceof Error ? error.message : 'Failed to load room details');
                setLoading(false);
            }
        };

        if (id) {
            fetchRoomDetail();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                {error || 'Room not found'}
            </div>
        );
    }

    const mapCenter = getMapCenter(room);

    // Lấy danh sách url ảnh từ houseImages
    const imageUrls = room.houseImages?.map((img: { imageUrl: string }) => img.imageUrl) || [];
    const defaultImage = '/img/imgLandingPage.png';
    const mainImage = imageUrls.length > 0 ? imageUrls[selectedImageIndex] : defaultImage;
    const additionalImages = imageUrls.length > 1 ? imageUrls : [];

    return (
        <div
            style={{
                maxWidth: 1100,
                margin: '0 auto',
                padding: 12,
                minHeight: 'unset',
                background: 'linear-gradient(180deg, #eaf3fb 0%, #f8fbff 100%)',
                fontFamily: 'inherit',
            }}
        >
            {/* Hàng trên: Ảnh chính | (thumbnail ngang + map + nút) */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 12 }}>
                {/* Ảnh chính */}
                <div style={{ position: 'relative', width: 420, height: 320, borderRadius: 18, overflow: 'hidden', background: '#eee', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    {/* Nhãn giá + số phòng còn trống */}
                    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
                        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ background: '#2F80ED', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-camera-video fs-6 text-white"></i>
                            </div>
                            <div>
                               
                                <div style={{ color: '#2F80ED', fontWeight: 700, fontSize: 10 }}>{room.price ? room.price.toLocaleString() : '0'} VND <span style={{ fontSize: 14, fontWeight: 400 }}>/tháng</span></div>
                            </div>
                        </div>
                    </div>
                    {/* Ảnh chính */}
                    <img
                        src={mainImage}
                        alt="Ảnh chính"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Tên phòng + địa chỉ overlay dưới */}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, padding: 0 }}>
                        <div style={{ background: '#fff', borderRadius: '0 0 18px 18px', boxShadow: '0 -2px 8px rgba(0,0,0,0.04)', padding: '16px 20px 12px 60px', position: 'relative', minHeight: 56 }}>
                            <div style={{ position: 'absolute', left: 20, top: 16, background: '#2F80ED', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-house-door fs-5 text-white"></i>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#2F80ED' }}>{room.name}</div>
                            <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{room.address}</div>
                        </div>
                    </div>
                </div>
                {/* Cột phải: thumbnail ngang + map + nút */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 320 }}>
                    {/* Thumbnail ngang */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                        {additionalImages.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                style={{
                                    width: 90,
                                    height: 68,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    border: selectedImageIndex === index ? '2px solid #2F80ED' : '1px solid #eee',
                                    cursor: 'pointer',
                                    background: '#fff',
                                    boxShadow: selectedImageIndex === index ? '0 2px 8px #2F80ED22' : 'none',
                                    transition: 'border 0.2s, box-shadow 0.2s',
                                }}
                                onMouseOver={e => e.currentTarget.style.border = '2px solid #90caf9'}
                                onMouseOut={e => e.currentTarget.style.border = selectedImageIndex === index ? '2px solid #2F80ED' : '1px solid #eee'}
                            >
                                <img
                                    src={url}
                                    alt={`Ảnh phòng ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Map + nút */}
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 0, width: '100%', overflow: 'hidden', position: 'relative', minHeight: 200 }}>
                        <div style={{ height: 200, width: '100%' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {room.absoluteLocation &&
                                    typeof room.absoluteLocation.latitude === 'number' &&
                                    !isNaN(room.absoluteLocation.latitude) &&
                                    typeof room.absoluteLocation.longitude === 'number' &&
                                    !isNaN(room.absoluteLocation.longitude) && (
                                        <Marker position={[room.absoluteLocation.latitude, room.absoluteLocation.longitude]}>
                                            <Popup>{room.address}</Popup>
                                        </Marker>
                                    )}
                            </MapContainer>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 12, marginLeft: 12, marginBottom: 12 }}>
                            <button className="btn btn-primary px-3 py-1 fw-bold" style={{ fontSize: '16px', borderRadius: 8 }}>
                                THUÊ NGAY
                            </button>
                            
                        </div>
                    </div>
                </div>
            </div>
            {/* Hàng dưới: Mô tả + chủ phòng */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
                {/* Mô tả chung */}
                <div style={{ flex: 2, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, minHeight: 120, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ background: '#2F80ED', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <i className="bi bi-file-text text-white fs-5"></i>
                        </div>
                        <h5 style={{ margin: 0, color: '#2F80ED', fontWeight: 700, fontSize: 20 }}>MÔ TẢ CHUNG</h5>
                    </div>
                    <div style={{ fontSize: 15, color: '#222', lineHeight: 1.7 }}>{room.description}</div>
                </div>
                {/* Chủ phòng */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, minHeight: 120, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <img
                            src={room.appUser?.avatar || '/img/imgLandingPage.png'}
                            alt={room.appUser?.displayName || 'avatar'}
                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2F80ED' }}
                        />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#2F80ED' }}>{room.appUser?.displayName || 'Chủ phòng'}</div>
                            <div style={{ color: '#2F80ED', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>SDT: {room.appUser?.number ? room.appUser.number.replace(/(\d{4})(\d{3})(\d{3})/, '$1$2$3').replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') : 'Chưa cập nhật'}</div>
                            <div style={{ color: '#FFD600', fontSize: 18 }}>
                                {[...Array(5)].map((_, index) => (
                                    <i
                                        key={index}
                                        className={`bi bi-star${index < (room.rate || 0) ? '-fill' : ''} me-1`}
                                    ></i>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button className="btn btn-outline-primary py-2 fw-bold" style={{ fontSize: '15px', borderRadius: 8, flex: 1 }}>
                            <i className="bi bi-chat-dots me-2"></i>
                            NHẮN TIN
                        </button>
                        <button className="btn btn-primary py-2 fw-bold" style={{ fontSize: '15px', borderRadius: 8, flex: 1 }}>
                            <i className="bi bi-telephone me-2"></i>
                            GỌI NGAY
                        </button>
                    </div>
                    <div style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{room.description}</div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;