import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';

interface appUser {
  address: string | null;
  avatar: string | null;
  displayName: string;
  email: string;  
  id: string;
  isDisable: boolean;
  number: string | null;
  numberOfHouse: number;
  userName: string | null;
  userRole: number;
}
interface Post {
  id: number;
  address: string;
  description: string;
  appUser: appUser;
  status: number;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const AdminPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'duyet-bai'>('duyet-bai');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const statusMap = {
    0: 'khả dụng',
    1: 'Không khả dụng',
    2: 'Đang chờ',
    3: 'Đã thuê',
    4: 'Đã xóa'
  };
  const navigate = useNavigate();
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/House/OrderByStatus`,
      );
      setPosts(response.data);
      
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApprove = async (postId: number) => {
    await axios.post(`${API_URL}/api/House/UpdateHouseStatus`, {

      houseId : postId,
      status : 0
    });
    fetchPosts();
  };

  const handleReject = async (postId: number) => {
    await axios.post(`${API_URL}/api/House/UpdateHouseStatus`, {
      houseId : postId,
      status : 4
    });
    fetchPosts();
  };
  const handleViewDetail = (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/phong/${roomId}`);
};
const initSignalR = useCallback(() => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/houseHub`, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    .build();

  // Lắng nghe sự kiện từ server
  connection.on("HouseCreated", () => {
    console.log("Nhận được sự kiện HouseCreated");
    fetchPosts();
  });

  // Debug kết nối
  connection
    .start()
    .then(() => {
      console.log("✅ Kết nối SignalR thành công");
    })
    .catch((err) => {
      console.error("❌ Kết nối SignalR thất bại:", err);
    });

  connection.onreconnecting((error) => {
    console.warn("🔄 Đang cố gắng kết nối lại SignalR...", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("✅ Đã kết nối lại SignalR. Connection ID:", connectionId);
  });

  connection.onclose((error) => {
    console.warn("❌ Kết nối SignalR đã đóng", error);
  });

  return () => {
    connection.stop();
    console.log("🛑 Kết nối SignalR đã được ngắt");
  };
}, [fetchPosts]);

useEffect(() => {
  initSignalR();
}, [initSignalR]);
  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = posts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(posts.length / recordsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Trang quản trị</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'duyet-bai' ? 'active' : ''}`}
            onClick={() => setActiveTab('duyet-bai')}
          >
            Duyệt bài đăng landlord
          </button>
        </li>
      </ul>
      {activeTab === 'duyet-bai' && (
        <div>
          {loading ? (
            <div>Đang tải...</div>
          ) : posts.length === 0 ? (
            <div>Không có bài đăng chờ duyệt.</div>
          ) : (
            <>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Địa chỉ</th>
                    <th>Mô tả</th>
                    <th>Chủ hộ</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map(post => (
                    <tr key={post.id}>
                      <td>{post.name}</td>
                      <td>{post.address}</td>
                      <td>{post.description}</td>
                      <td>{post.appUser?.displayName || 'N/A'}</td>
                      <td>{statusMap[post.status as keyof typeof statusMap]}</td>
                      <td >
                        <div className='d-flex align-items-center gap-2'>
                        
                        <button className=" btn btn-danger btn-sm" onClick={() => handleReject(post.id)}>Xóa</button>
                        <button className="btn btn-primary  btn-sm" onClick={(e) => handleViewDetail(post.id,e)}>Detail</button>
                        {
                          post.status === 2 && (
                            <>
                              <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(post.id)}>Duyệt</button>
                            </>
                          )
                        }
                        </div>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <nav aria-label="Page navigation">
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage; 