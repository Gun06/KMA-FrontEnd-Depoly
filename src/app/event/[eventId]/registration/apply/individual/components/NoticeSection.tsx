// 안내사항 섹션 컴포넌트
import React from 'react';

interface NoticeSectionProps {
  isEditMode?: boolean;
  className?: string;
}

export default function NoticeSection({ 
  isEditMode = false, 
  className = "bg-gray-50 p-4 sm:p-6 mb-6 sm:mb-8 rounded-lg" 
}: NoticeSectionProps) {
  return (
    <div className={className}>
      {isEditMode ? (
        <p className="text-sm sm:text-base text-gray-700">
          신청 정보를 수정한 후, 수정 완료를 클릭하세요.
        </p>
      ) : (
        <>
          <p className="text-sm sm:text-base text-gray-700 mb-2">
            신청 내역을 확인하기 위해 신청서와 동일한 정보를 입력한 후, 확인하기를 클릭하세요.
          </p>
          <p className="text-sm sm:text-base text-gray-700">
            비밀번호를 잊어버린 경우, 신청확인 페이지에서 비밀번호 초기화를 이용해주세요.
          </p>
        </>
      )}
    </div>
  );
}
