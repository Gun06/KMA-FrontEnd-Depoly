'use client';

import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

interface SecretPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  isLoading?: boolean;
}

export const SecretPostModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: SecretPostModalProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    setError('');
    try {
      await onConfirm(password);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              비밀글입니다!
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            이 글은 비밀글로 설정되어 있어 작성자만 볼 수 있습니다.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 비밀번호 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="비밀번호를 입력해주세요"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {/* 에러 메시지 */}
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? '확인 중...' : '확인'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
