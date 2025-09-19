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
        <p>* 쿠폰번호에는 참가권을 구매하신분만 입력하세요, 임의 입력시 신청과정 중 오류가 발생합니다</p>
        <p>* 쿠폰사용으로 기념품을 원하실경우 해당종목 차액금을 입금 해주셔야 수령하실 수 있습니다</p>
        <p>* 휴대폰번호는 완주 기록 SMS 발송 서비스시 사용됩니다</p>
      </div>
    </div>
  );
}
