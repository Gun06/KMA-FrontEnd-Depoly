// 단체신청 제출 버튼 컴포넌트
import React from 'react';

interface SubmitButtonProps {
  isFormValid: boolean;
  isSubmitted: boolean;
  isEditMode?: boolean;
  className?: string;
}

export default function SubmitButton({
  isFormValid,
  isSubmitted,
  isEditMode = false,
  className = "w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-4 rounded-lg transition-colors font-medium text-base sm:text-lg flex items-center justify-center"
}: SubmitButtonProps) {
  return (
    <div className="mt-6 sm:mt-8 flex justify-center">
      <button
        type="submit"
        disabled={isSubmitted}
        className={`${className} ${
          !isSubmitted
            ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitted ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>처리 중...</span>
          </div>
        ) : (
          isEditMode ? '수정 완료' : '신청하기'
        )}
      </button>
    </div>
  );
}
