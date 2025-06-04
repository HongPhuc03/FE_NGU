import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import CreateRoomModal from '../components/CreateRoomModal';
import NotOwnerModal from '../modals/NotLandlordOwner';

interface User {
    id: string;
    role: number;
    displayName: string;
    email: string;
}
interface HouseImage {
    id: number;
    link: string;
  }
interface Comment {
    id: number;
    content: string;
    userId: string;
    houseId: number;
}

interface Room {
    id: number;
    address: string;
    description: string;
    area: number;
    houseImages: HouseImage[] | null;
    comments: Comment[];
    status: number;
    appUser: {
        id: string;
        displayName: string;
        number: string;
        email: string | null;
        avatar: string | null;
        isDisable: boolean;
    };
}

const LandlordPage = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        if (!storedUser) {
          navigate('/');
          return;
        }
        try {
          const user: User = JSON.parse(storedUser);
          
    
          if (user.role === 2) {
            setShowModal(true);
            setLoading(false);
            return;
          } else {
            setShowModal(false);
          }
    
          fetchLandlordRooms();
          
        } catch (error) {
          console.error('Lỗi khi đọc user từ localStorage', error);
          navigate('/');
        }
      }, [navigate]);

    const fetchLandlordRooms = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/House/GetAllHouseByUser`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setRooms(response.data);
            console.log(response.data); 
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch rooms');
            setLoading(false);
            console.error('Error fetching rooms:', error);
        }
    };

    const handleDeleteRoom = async (houseid: number) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await axios.delete(`${API_URL}/api/House/DeleteHouse?houseid=${houseid}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                fetchLandlordRooms(); // Refresh the list
            } catch (error) {
                setError('Failed to delete room');
                console.error('Error deleting room:', error);
            }
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return "Có sẵn";
            case 1: return "Không khả dụng";
            case 2: return "Chờ duyệt";
            case 3: return "Đã thuê";
            case 4: return "Đã xóa";
            default: return "Không xác định";
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '80px' }}>
        <div className="container py-2">
            <NotOwnerModal 
                open={showModal} 
                onClose={() => setShowModal(false)}
                onBecomeOwner={() => {
                    navigate('/thanh-toan');
                }}
            />
            {!showModal && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4" style={{paddingTop: '80px'}}>
                        <h2>Quản lý phòng trọ</h2>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Thêm phòng mới
                        </button>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">Bạn chưa có phòng trọ nào</h4>
                            <p className="text-muted">Hãy thêm phòng trọ đầu tiên của bạn!</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {rooms.map(room => (
                                <div key={room.id} className="col-md-6 col-lg-4">
                                    <div
                                        className={`card h-100 border-0 shadow-sm
                                            ${room.status === 2 ? 'bg-secondary-subtle text-dark' : ''}
                                            ${room.status === 4 ? 'bg-danger-subtle text-dark' : ''}`}
                                    >
                                    <img 
                                        src={room.houseImages?.[0]?.link ?? './img/imgLandingPage.png'}
                                        className="card-img-top" 
                                        alt={room.address} 
                                        style={{ height: '200px', objectFit: 'cover' }} 
                                    />
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title mb-0">{room.address}</h5>
                                                <span className="badge bg-primary">{room.area.toLocaleString()}m²</span>
                                            </div>
                                            <p className="card-text text-muted small mb-3">{room.description}</p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                
                                                    trạng thái :  {getStatusText(room.status)}
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => navigate(`/phong/${room.id}`)}
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        Xem
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <CreateRoomModal 
                        show={showCreateModal}
                        onHide={() => setShowCreateModal(false)}
                        onSubmit={(roomData) => {
                            console.log(roomData);
                            setShowCreateModal(false);
                            fetchLandlordRooms(); // Refresh the room list after creating a new room
                        }}
                        fetchRooms={fetchLandlordRooms}
                    />
                </>
            )}
        </div>
        </div>

    );
};

export default LandlordPage; 
