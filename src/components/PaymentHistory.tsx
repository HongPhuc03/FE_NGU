import React, { useEffect, useState } from 'react';
import { Table, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import type { AxiosError } from 'axios';

interface PaymentRecord {
    id: number;
    orderCode: number;
    userId: string;
    subscriptionPlanId: number;
    amount: number;
    status: number;
    description: string;
    createdAt: string;
    paidAt: string | null;
    paymentURl: string | null;
    subscriptionPlan: any | null;
}

const PaymentHistory: React.FC = () => {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    throw new Error('Vui lòng đăng nhập để xem lịch sử thanh toán');
                }

                const response = await axios.post(
                    'https://localhost:7135/api/Subscription/GetAllPayment',
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );

                setPayments(response.data);
            } catch (err) {
                const error = err as AxiosError<{ message?: string }>;
                setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải lịch sử thanh toán');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' VND';
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0:
                return <Badge bg="warning">Chờ thanh toán</Badge>;
            case 1:
                return <Badge bg="success">Đã thanh toán</Badge>;
            default:
                return <Badge bg="secondary">Không xác định</Badge>;
        }
    };

    if (loading) {
        return <div className="text-center p-4">Đang tải...</div>;
    }

    if (error) {
        return <div className="alert alert-danger m-4">{error}</div>;
    }

    return (
        <Card className="m-4">
            <Card.Header>
                <h4 className="mb-0">Lịch sử thanh toán</h4>
            </Card.Header>
            <Card.Body>
                <Table responsive hover>
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Mô tả</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Ngày thanh toán</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-gray-500 py-4">
                                    Bạn chưa có lịch sử thanh toán nào.
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>{payment.orderCode}</td>
                                    <td>{payment.description}</td>
                                    <td>{formatAmount(payment.amount)}</td>
                                    <td>{getStatusBadge(payment.status)}</td>
                                    <td>{formatDate(payment.createdAt)}</td>
                                    <td>{payment.paidAt ? formatDate(payment.paidAt) : '-'}</td>
                                    <td>
                                        {payment.status === 0 && payment.paymentURl && (
                                            <a 
                                                href={payment.paymentURl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                            >
                                                Thanh toán
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default PaymentHistory; 