import React from 'react';

interface NotOwnerModalProps {
  open: boolean;
  onClose: () => void;
  onBecomeOwner?: () => void;
}

const NotOwnerModal: React.FC<NotOwnerModalProps> = ({ open, onClose, onBecomeOwner }) => {
  if (!open) return null;

  return (
    <div style={{ paddingTop: '80px' }}><div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm text-center relative">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn hiện không phải là <span className="font-semibold text-blue-600">chủ hộ</span>.<br />
            Vui lòng trở thành chủ hộ để được vào trang này.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            Đóng
          </button>
          {onBecomeOwner && (
            <button
              onClick={onBecomeOwner}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Trở thành chủ hộ
            </button>
          )}
        </div>
      </div>
    </div></div>
    
  );
};

export default NotOwnerModal;
