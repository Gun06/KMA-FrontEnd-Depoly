'use client';

import { CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button/Button';

interface SuccessModalProps {
  isOpen: boolean;
  onViewDetail: () => void;
  onBackToList: () => void;
}

export default function SuccessModal({
  isOpen,
  onViewDetail,
  onBackToList,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 - 클릭해도 닫히지 않음 (반드시 선택해야 함) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 모달 컨테이너 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto flex flex-col transform transition-all duration-300 scale-100 border border-gray-200"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* 헤더 영역 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="text-center">
            {/* 아이콘 */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-50">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            {/* 제목 */}
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              지역대회 등록이 완료되었습니다
            </h3>
          </div>
        </div>

        {/* 버튼 영역 - 한 줄 가운데 정렬, 동일 너비 */}
        <div className="flex-shrink-0 px-6 pb-6 pt-2 flex flex-row gap-3 justify-center items-center">
          <Button
            tone="primary"
            widthType="pager"
            size="md"
            onClick={onViewDetail}
          >
            상세보기
          </Button>
          <Button
            tone="outlineDark"
            variant="outline"
            widthType="pager"
            size="md"
            onClick={onBackToList}
          >
            목록으로
          </Button>
        </div>
      </div>
    </div>
  );
}

