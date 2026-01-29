// 하단 안내사항 섹션 컴포넌트
import React from 'react';

interface BottomNoticeSectionProps {
  className?: string;
}

export default function BottomNoticeSection({ 
  className = "bg-gray-50 p-4 sm:p-6 rounded-lg" 
}: BottomNoticeSectionProps) {
  return (
    <div className={className}>
      <div className="space-y-2 text-sm sm:text-base text-gray-700">
        <p>* 쿠폰(참가권 티켓) 사용을 원하시는 경우, 참가 신청 후 게시판에 성함/생년월일/쿠폰 번호를 남겨주세요.</p>
        <p>* 참가금이 쿠폰 금액을 초과하는 경우, 참가 신청 후 차액금은 입금하여야 합니다.</p>
        <p>* 입금 처리는 입금한 날로부터 3일 내로 진행됩니다. 반드시 신청내역 조회에서 확인하시길 바랍니다.</p>
      </div>
    </div>
  );
}
