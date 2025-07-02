import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as signalR from '@microsoft/signalr';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// Lazy load components
const ZoomToMarker = lazy(() => import('../components/ZoomToMarker'));
const CreateRoomModal = lazy(() => import('../components/CreateRoomModal'));

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom styles for the tooltip
const tooltipStyle = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '6px 10px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
        fontSize: '13px',
        fontWeight: '500',
        color: '#2c3e50',
        minWidth: '120px',
        textAlign: 'center' as const
    },
    price: {
        fontSize: '11px',
        color: '#3498db',
        fontWeight: 'bold',
        marginTop: '2px'
    }
};

interface AbsoluteLocation {
    id: number;
    latitude: number;
    longitude: number;
}

interface AppUser {
    id: string;
    displayName: string;
    number: string | null;
    email: string;
    avatar: string | null;
}

interface HouseImage {
    id: number;
    imageUrl: string;
}

interface Room {
    id: number;
    address: string;
    description: string;
    area: number;
    absoluteLocation: AbsoluteLocation;
    houseImages: HouseImage[];
    comments: null;
    appUser: AppUser;
    price: number;
}

interface UserLocation {
    id?: number;
    lat: number;
    ing: number;
    userId?: string;
}

const RoomList = () => {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [addressFilter, setAddressFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;
    const navigate = useNavigate();
    const { user } = useAuth();

    // Thay thế các URL API
    const API_URL = import.meta.env.VITE_API_URL || "https://roomate-production.up.railway.app";

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/User/UserDetail`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            console.log(response.data.displayName)
            if (response.data && response.data.userLocation) {
                setUserLocation({
                    id: response.data.userLocation.id,
                    lat: response.data.userLocation.lat,
                    ing: response.data.userLocation.ing
                });
            }
        } catch (err) {
            console.error('Failed to fetch user info:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserInfo();
        }
    }, [user]);

    const fetchRooms = useCallback(async () => {
        try {
            let url = `${API_URL}/api/House/GetAllHouse`;
            
            const params = new URLSearchParams();

            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (addressFilter) params.append('address', addressFilter);

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await axios.post(url);
            if (!response.data) {
                throw new Error('Failed to fetch rooms');
            }
            console.log(response.data);
            setRooms(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    }, [minPrice, maxPrice, addressFilter, API_URL]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const initSignalR = useCallback(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/houseHub`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connection.on("HouseCreated", () => {
            fetchRooms();
        });
        connection.on("HouseUpdate", () => {
            fetchRooms();
        });
        connection.on("HouseDelete", (data) => {
            setRooms(prevRooms => prevRooms.filter(room => room.id !== data.id));
        });

        connection.start()
            .catch(err => console.error("Kết nối SignalR thất bại:", err));

        return () => {
            connection.stop();
        };
    }, [fetchRooms]);

    useEffect(() => {
        initSignalR();
    }, [initSignalR]);

    const handleViewDetail = (roomId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/phong/${roomId}`);
    };

    const handleRoomClick = (room: Room, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedRoom?.id === room.id) {
            setSelectedRoom(null);
        } else {
            setSelectedRoom(room);
        }
    };

    const defaultCenter: [number, number] = [16.047079, 108.206230];

    const center: [number, number] =
        userLocation?.lat != null && userLocation?.ing != null
            ? [userLocation.lat, userLocation.ing]
            : defaultCenter;


    // Calculate pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = rooms.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(rooms.length / recordsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const userMarker = userLocation && userLocation.lat && userLocation.ing ? (
        <Marker
            position={[userLocation.lat, userLocation.ing]}
            icon={L.icon({
                iconUrl: icon,
                shadowUrl: iconShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                // Use a red marker icon if you have one, or override with CSS below
                className: 'user-marker-red'
            })}
        >
            <Tooltip
                permanent
                direction="top"
                offset={[0, -20]}
                opacity={1}
                interactive={true}
            >
                <div
                    style={{
                        ...tooltipStyle.container,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '12px',
                        padding: '4px 8px',
                        minWidth: '100px',
                        backgroundColor: '#e74c3c', // Red background
                        color: '#fff', // White text
                        border: '2px solid #c0392b'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                >
                    <span>
                        <strong>Vị trí của bạn</strong>
                    </span>
                </div>
            </Tooltip>
        </Marker>
    ) : null;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
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
        <div className="room-list-page" style={{ backgroundImage: 'url("./img/backgroundRoomList.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '100vh', padding: '2rem' }}>
            <div style={{
                height: '600px',
                width: '100%',
                marginBottom: '2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <MapContainer
                    center={center}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    maxZoom={18}
                    minZoom={11}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {userMarker}
                    {rooms.map((room) => (
                        room.absoluteLocation &&
                        typeof room.absoluteLocation.latitude === 'number' &&
                        !isNaN(room.absoluteLocation.latitude) &&
                        typeof room.absoluteLocation.longitude === 'number' &&
                        !isNaN(room.absoluteLocation.longitude) && (
                            <React.Fragment key={room.id}>
                                <Marker
                                    position={[room.absoluteLocation.latitude, room.absoluteLocation.longitude]}
                                    eventHandlers={{
                                        click: () => handleRoomClick(room),
                                    }}
                                >
                                    <Tooltip
                                        permanent
                                        direction="top"
                                        offset={[0, -20]}
                                        opacity={1}
                                        interactive={true}
                                    >
                                        <div
                                            onClick={(e) => handleRoomClick(room, e)}
                                            style={{
                                                ...tooltipStyle.container,
                                                cursor: 'pointer',
                                                transform: selectedRoom?.id === room.id ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: selectedRoom?.id === room.id
                                                    ? 'rgba(52, 152, 219, 0.95)'
                                                    : 'rgba(255, 255, 255, 0.95)',
                                                color: selectedRoom?.id === room.id
                                                    ? '#ffffff'
                                                    : '#2c3e50',
                                                border: selectedRoom?.id === room.id
                                                    ? '2px solid #2980b9'
                                                    : 'none',
                                                boxShadow: selectedRoom?.id === room.id
                                                    ? '0 4px 15px rgba(52, 152, 219, 0.3)'
                                                    : '0 3px 10px rgba(0, 0, 0, 0.15)',
                                                fontSize: '12px',
                                                padding: '4px 8px',
                                                minWidth: '100px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = selectedRoom?.id === room.id ? 'scale(1.1)' : 'scale(1)';
                                            }}
                                        >
                                            <span style={{
                                                fontWeight: selectedRoom?.id === room.id ? '600' : '500',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '150px',
                                                display: 'block'
                                            }}>{room.address}</span>
                                            <span style={{
                                                ...tooltipStyle.price,
                                                color: selectedRoom?.id === room.id ? '#ffffff' : '#3498db',
                                                fontWeight: selectedRoom?.id === room.id ? '600' : 'bold',
                                                fontSize: '11px'
                                            }}>
                                                {room.area?.toLocaleString() || '0'}m²
                                            </span>
                                            <Link
                                                to={`/phong/${room.id}`}
                                                style={{
                                                    display: 'block',
                                                    textDecoration: 'none',
                                                    backgroundColor: selectedRoom?.id === room.id ? '#ffffff' : '#3498db',
                                                    color: selectedRoom?.id === room.id ? '#3498db' : '#ffffff',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    marginTop: '4px',
                                                    fontSize: '11px',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </Tooltip>
                                    <Popup>
                                        <div style={{
                                            padding: '5px',
                                            minWidth: '200px'
                                        }}>
                                            <h5 style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                marginBottom: '8px',
                                                color: '#2c3e50'
                                            }}>{room.address}</h5>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#7f8c8d',
                                                marginBottom: '5px'
                                            }}>{room.description}</p>
                                            <p style={{
                                                fontSize: '15px',
                                                fontWeight: 'bold',
                                                color: '#3498db',
                                                marginBottom: '0'
                                            }}>Diện tích: {room.area?.toLocaleString() || '0'}m²</p>
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '5px 0',
                                                borderTop: '1px solid #eee',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '12px',
                                                color: '#95a5a6'
                                            }}>
                                                <span><i className="bi bi-people me-1"></i>{room.appUser?.displayName || '-'}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                                {room.absoluteLocation &&
                                    typeof room.absoluteLocation.latitude === 'number' &&
                                    !isNaN(room.absoluteLocation.latitude) &&
                                    typeof room.absoluteLocation.longitude === 'number' &&
                                    !isNaN(room.absoluteLocation.longitude) && (
                                        <Suspense fallback={null}>
                                            <ZoomToMarker
                                                position={[room.absoluteLocation.latitude, room.absoluteLocation.longitude]}
                                                isSelected={selectedRoom?.id === room.id}
                                            />
                                        </Suspense>
                                    )}
                            </React.Fragment>
                        )
                    ))}
                </MapContainer>
            </div>

            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-0">GẦN BẠN</h2>
                        <p className="text-muted mb-0">Những căn phòng gần vị trí của bạn nhất</p>
                    </div>
                    <div className="filter-buttons mb-3">
                    </div>
                </div>
                <div className="filter-section p-3 bg-white rounded-lg shadow-sm mb-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-currency-dollar"></i>
                                </span>
                                <input
                                    type="number"
                                    className="form-control border-start-0"
                                    placeholder="Giá thấp nhất"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-currency-dollar"></i>
                                </span>
                                <input
                                    type="number"
                                    className="form-control border-start-0"
                                    placeholder="Giá cao nhất"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-geo-alt"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Nhập địa chỉ"
                                    value={addressFilter}
                                    onChange={(e) => setAddressFilter(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {currentRecords.length === 0 ? (
                        <div className="col-12 text-center">
                            <p>Không tìm thấy phòng nào.</p>
                        </div>
                    ) : (
                        currentRecords.map(room => (
                            <div
                                key={room.id}
                                className="col-md-6 col-lg-4"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    handleRoomClick(room);
                                    setSelectedRoom(room);
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth'
                                    });
                                }}
                            >
                                <div className={`card h-100 border-0 shadow-sm ${selectedRoom?.id === room.id ? 'border border-primary' : ''}`}>
                                    <img
                                        src={room.houseImages?.[0]?.imageUrl ?? './img/imgLandingPage.png'}
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
                                        <div className="d-flex justify-content-between text-muted small">
                                            <span><i className="bi bi-people me-1"></i>{room.appUser?.displayName}</span>
                                        </div>
                                        <div className="mt-3 d-grid">
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={(e) => handleViewDetail(room.id, e)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>


                {/* Pagination */}
                <nav aria-label="Page navigation" className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => (
                            <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            <Suspense fallback={null}>
                <CreateRoomModal
                    show={showCreateModal}
                    onHide={() => setShowCreateModal(false)}
                    onSubmit={(roomData) => {
                        console.log(roomData);
                        setShowCreateModal(false);
                        fetchRooms();
                    }}
                    fetchRooms={fetchRooms}
                />
            </Suspense>
        </div>
    );
};

export default RoomList;