import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import type { AxiosError } from 'axios';

interface RoomFormData {
    name: string;
    address: string;
    price: number;
    area: number;
    description: string;
    images: string[];
}

interface CreateRoomModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (roomData: RoomFormData) => void;
    fetchRooms: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ show, onHide, onSubmit, fetchRooms }) => {
    const [formData, setFormData] = useState<Omit<RoomFormData, 'price'> & { priceInput: string }>({
        name: '',
        address: '',
        priceInput: '',
        area: 0,
        description: '',
        images: []
    });
    const [parsedPrice, setParsedPrice] = useState<number | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parse price input
    const parsePrice = (value: string) => {
        const lower = value.toLowerCase().trim();
        let number = 0;
        if (lower.includes("triệu")) {
            const n = parseFloat(lower.replace("triệu", "").trim().replace(",", "."));
            if (!isNaN(n)) number = n * 1_000_000;
        } else {
            const cleaned = lower.replace(/,/g, "");
            if (!isNaN(Number(cleaned))) number = Number(cleaned);
        }
        return number || null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price') {
            setFormData(prev => ({ ...prev, priceInput: value }));
            setParsedPrice(parsePrice(value));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'area' ? Number(value) : value
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            setSelectedImages(prev => [...prev, ...files]);
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = [...prev];
            URL.revokeObjectURL(newUrls[index]);
            return newUrls.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Vui lòng đăng nhập để tạo phòng');
            }

            // Create FormData to send files
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('price', (parsedPrice ?? 0).toString());
            formDataToSend.append('area', formData.area.toString());
            formDataToSend.append('description', formData.description);

            selectedImages.forEach((file) => {
                formDataToSend.append('images', file);
            });

            const response = await axios.post(
                'https://localhost:7135/api/House/CreateHouse',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data) {
                onSubmit({
                    ...formData,
                    price: parsedPrice ?? 0,
                    images: [] // hoặc truyền selectedImages nếu cần
                });
                fetchRooms();
                onHide();
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi tạo phòng';
            setError(errorMessage);
            console.error('Error creating room:', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Tạo phòng mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên phòng</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Giá phòng (VND/Tháng)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="price"
                                    value={formData.priceInput}
                                    onChange={handleInputChange}
                                    required
                                />
                                {parsedPrice !== null && (
                                    <div
                                        className="text-primary mt-1"
                                        style={{ cursor: "pointer" }}
                                        title="Bấm để điền lại giá vào ô nhập"
                                        onClick={() => setFormData(prev => ({ ...prev, priceInput: parsedPrice.toLocaleString("vi-VN") }))}
                                    >
                                        {parsedPrice.toLocaleString("vi-VN")}
                                    </div>
                                )}
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Diện tích (m²)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Hình ảnh</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {previewUrls.length > 0 && (
                            <div className="mt-3">
                                <div className="d-flex gap-2 flex-wrap">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="position-relative">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0
                                                }}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang tạo...' : 'Tạo phòng'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateRoomModal;