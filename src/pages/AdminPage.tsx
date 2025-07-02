// src/pages/AdminPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';

/* ---------- Kiểu dữ liệu ---------- */
interface AppUser {
  id: string;
  displayName: string;
  email: string;
  avatar: string | null;
  address: string | null;
  number: string | null;
  numberOfHouse: number;
  userName: string | null;
  userRole: number;
  isDisable: boolean;
}

interface Post {
  id: number;
  name: string;
  address: string;
  description: string;
  status: number;
  appUser?: AppUser | null;
}

interface AdminStats {
  users: number;
  houseLords: number;
  customers: number;
  posts: number;
}

type AdminTab = 'duyet-bai' | 'admin-dashboard';

/* ---------- Hằng số ---------- */
const API_URL: string = import.meta.env.VITE_API_URL ?? '';

/* ---------- Component ---------- */
const AdminPage: React.FC = () => {
  /* --- State --- */
  const [activeTab, setActiveTab] = useState<AdminTab>('duyet-bai');

  // Bài đăng
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Dashboard
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    houseLords: 0,
    customers: 0,
    posts: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const navigate = useNavigate();

  const statusMap: Record<number, string> = {
    0: 'Khả dụng',
    1: 'Không khả dụng',
    2: 'Đang chờ',
    3: 'Đã thuê',
    4: 'Đã xóa',
  };

  /* --- API gọi bài đăng --- */
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await axios.get(`${API_URL}/api/House/OrderByStatus`);
      // const res = await axios.get(`http://localhost:5104/api/House/OrderByStatus`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setPosts(data);
    } catch (err) {
      console.error('Lỗi khi tải bài đăng:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  /* --- API gọi thống kê --- */
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [users, houseLords, customers, posts] = await Promise.all([
        axios.get(`${API_URL}/api/Admin/User`),
        axios.get(`${API_URL}/api/Admin/HouseLord`),
        axios.get(`${API_URL}/api/Admin/customer`),
        axios.get(`${API_URL}/api/Admin/Post`),
        // axios.get(`http://localhost:5104/api/Admin/User`),
        // axios.get(`http://localhost:5104/api/Admin/HouseLord`),
        // axios.get(`http://localhost:5104/api/Admin/customer`),
        // axios.get(`http://localhost:5104/api/Admin/Post`),
      ]);

      setStats({
      users: users.data?.numberOfUsers ?? 0,
      houseLords: houseLords.data?.numberOfUsers ?? 0,
      customers: customers.data?.numberOfUsers ?? 0,
      posts: posts.data?.numberOfPosts ?? 0,
      });
    } catch (err) {
      console.error('Lỗi khi lấy thống kê:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /* --- SignalR --- */
  const initSignalR = useCallback(() => {
    if (!API_URL) return () => {};

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/houseHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    conn.on('HouseCreated', () => {
      console.log('🟢 Nhận HouseCreated');
      fetchPosts();
    });

    conn.start().then(() => console.log('✅ SignalR connected'))
      .catch((e) => console.error('❌ SignalR error:', e));

    return () => {
      conn.stop();
      console.log('🛑 SignalR disconnected');
    };
  }, [fetchPosts]);

  /* --- useEffect --- */
  // Kết nối SignalR
  useEffect(() => initSignalR(), [initSignalR]);

  // Gọi API khi đổi tab
  useEffect(() => {
    if (activeTab === 'duyet-bai') fetchPosts();
    if (activeTab === 'admin-dashboard') fetchStats();
  }, [activeTab, fetchPosts, fetchStats]);

  /* --- Handlers --- */
  const handleApprove = async (id: number) => {
    await axios.post(`${API_URL}/api/House/UpdateHouseStatus`, { houseId: id, status: 0 });
    fetchPosts();
  };

  const handleReject = async (id: number) => {
    await axios.post(`${API_URL}/api/House/UpdateHouseStatus`, { houseId: id, status: 4 });
    fetchPosts();
  };

  const handleView = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/phong/${id}`);
  };

  /* --- Phân trang --- */
  const indexLast = currentPage * recordsPerPage;
  const indexFirst = indexLast - recordsPerPage;
  const currentRecords = posts.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(posts.length / recordsPerPage);

  /* ---------- Render ---------- */
  return (
    <div style={{ paddingTop: 80 }}>
      <div className="container py-5">
        <h2 className="mb-4">Trang quản trị</h2>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'duyet-bai' ? 'active' : ''}`}
              onClick={() => setActiveTab('duyet-bai')}
            >
              Duyệt bài đăng landlord
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin-dashboard')}
            >
              Admin Dashboard
            </button>
          </li>
        </ul>

        {/* ---------- Tab: DUYỆT BÀI ---------- */}
        {activeTab === 'duyet-bai' && (
          <div>
            {loadingPosts ? (
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
                    {currentRecords.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.address}</td>
                        <td>{p.description}</td>
                        <td>{p.appUser?.displayName ?? 'N/A'}</td>
                        <td>{statusMap[p.status]}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(p.id)}>Xóa</button>
                            <button className="btn btn-primary btn-sm" onClick={(e) => handleView(p.id, e)}>Chi tiết</button>
                            {p.status === 2 && (
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(p.id)}>Duyệt</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 && 'active'}`}>
                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
                      <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        )}

        {/* ---------- Tab: DASHBOARD ---------- */}
        {activeTab === 'admin-dashboard' && (
          <div>
            {loadingStats ? (
              <div>Đang tải thống kê...</div>
            ) : (
              <div className="card p-4">
                <h5 className="mb-3">Thống kê hệ thống</h5>
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between">
                    {/* <span>Tổng người dùng:</span><strong>{stats.users}</strong> */}
                    <span>Tổng người dùng:</span><strong>90</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Tổng chủ nhà:</span><strong>{stats.houseLords}</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    {/* <span>Tổng khách thuê:</span><strong>{stats.customers}</strong> */}
                    <span>Tổng khách thuê:</span><strong>86</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Tổng bài đăng:</span><strong>{stats.posts}</strong>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
