import React, { useEffect, useState } from 'react';
import axios from 'axios';
interface appUser {
  address: string | null;
  avatar: string | null;
  displayName: string;
  email: string;
  id: string;
  isDisable: boolean;
  number: string | null;
  numberOfHouse: number;
  subscription: any | null;
  userLocation: any | null;
  userName: string | null;
  userRole: number;
}
interface Post {
  id: number;
  address: string;
  description: string;
  appUser: appUser;
  status: number;
}

const AdminPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'duyet-bai'>('duyet-bai');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
     
      const response = await axios.get(
        "https://localhost:7135/api/House/OrderByStatus",
        
      );
      console.log(response.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: number) => {
    await axios.post(`https://localhost:7135/api/Admin/ApprovePost?id=${postId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
    fetchPosts();
  };

  const handleReject = async (postId: number) => {
    await axios.post(`https://localhost:7135/api/Admin/RejectPost?id=${postId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
    fetchPosts();
  };

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
                      <td>{post.address}</td>
                      <td>{post.description}</td>
                      <td>{post.appUser?.displayName || 'N/A'}</td>
                      <td>{post.status}</td>
                      <td>
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(post.id)}>Duyệt</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(post.id)}>Từ chối</button>
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