import React, { useState } from 'react';

const LienHe: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gửi dữ liệu tới API hoặc email ở đây
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div
      style={{
        paddingTop: '100px',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #e0eafc 0%, #fff 100%)',
      }}
    >
      <div className="container py-5">
        <h2 className="mb-4 text-primary fw-bold">Liên hệ với chúng tôi</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="mb-3">
              <strong>Địa chỉ:</strong> Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng
            </div>
            <div className="mb-3">
              <strong>Email:</strong> roomate@gmail.com
            </div>
            <div className="mb-3">
              <strong>Điện thoại:</strong> 0901162097
            </div>
            <div className="mb-3">
              <iframe
                title="Bản đồ"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.856168122403!2d108.25831101119219!3d15.968885884632295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142116949840599%3A0x365b35580f52e8d5!2zxJDhuqFpIGjhu41jIEZQVCDEkMOgIE7hurVuZw!5e0!3m2!1svi!2s!4v1748955508695!5m2!1svi!2s"
                width="100%"
                height="347"
                style={{ border: 0, borderRadius: 8 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
              <h5 className="mb-3">Gửi liên hệ</h5>
              {sent && (
                <div className="alert alert-success py-2">Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.</div>
              )}
              <div className="mb-3">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nội dung</label>
                <textarea
                  className="form-control"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Gửi liên hệ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LienHe; 