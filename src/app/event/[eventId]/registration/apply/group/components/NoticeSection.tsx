// 단체신청 안내사항 섹션 컴포넌트
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
          단체 신청 정보를 수정한 후, 확인 비밀번호를 입력하고 수정 완료를 클릭하세요.
        </p>
      ) : (
        <>
          <p className="text-sm sm:text-base font-normal leading-normal text-gray-700 mb-2">
            단체 신청 시 필요한 단체 조회용 ID를 생성해주세요. 생성 후 중복확인을 클릭하세요.
          </p>
          <p className="text-sm sm:text-base font-normal leading-normal text-gray-700 mb-2">
            단체 비밀번호를 생성하시기 바랍니다. 비밀번호를 잊어버린 경우, 신청조회 페이지에서 비밀번호 초기화를 이용해주세요.
          </p>
          <p className="text-sm sm:text-base font-normal leading-normal text-red-600">
            [개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.
          </p>
        </>
      )}
    </div>
  );
}
