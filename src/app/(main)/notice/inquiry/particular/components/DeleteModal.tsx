import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal = ({ isOpen, isDeleting, onConfirm, onCancel }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">문의사항 삭제</h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              정말로 이 문의사항을 삭제하시겠습니까?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-sm text-red-700 space-y-1">
                <li>• 삭제된 문의사항은 복구할 수 없습니다</li>
                <li>• 첨부파일도 함께 삭제됩니다</li>
                <li>• 이 작업은 되돌릴 수 없습니다</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  삭제하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

