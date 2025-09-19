import { X, Lock } from 'lucide-react';

interface SecretPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretPostModal = ({ isOpen, onClose }: SecretPostModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* 모달 내용 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            비밀글입니다!
          </h3>
          
          <p className="text-gray-600 mb-6">
            이 글은 비밀글로 설정되어 있어<br />
            작성자만 볼 수 있습니다.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
