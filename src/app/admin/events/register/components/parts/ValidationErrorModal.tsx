'use client';

import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  errors: string[];
  fieldRefs?: Map<string, React.RefObject<HTMLElement>>;
}

export default function ValidationErrorModal({
  isOpen,
  onClose,
  title = '필수 항목을 확인해 주세요.',
  errors,
  fieldRefs,
}: ValidationErrorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 필드 이름을 실제 필드 ID로 매핑
  const getFieldId = (errorText: string): string | null => {
    if (errorText.includes('개최일') || errorText.includes('개최 시/분')) return 'date';
    if (errorText.includes('신청시작일') || errorText.includes('신청시작 시/분')) return 'registStartDate';
    if (errorText.includes('접수마감일') || errorText.includes('접수마감 시/분')) return 'deadlineDate';
    if (errorText.includes('입금마감일') || errorText.includes('입금마감 시/분')) return 'paymentDeadlineDate';
    if (errorText.includes('대회명(한글)')) return 'titleKo';
    return null;
  };

  // 모달이 열릴 때 첫 번째 에러 필드로 스크롤
  useEffect(() => {
    if (isOpen && errors.length > 0 && fieldRefs) {
      const firstError = errors[0];
      const fieldId = getFieldId(firstError);
      
      if (fieldId && fieldRefs.has(fieldId)) {
        const fieldRef = fieldRefs.get(fieldId);
        if (fieldRef?.current) {
          // 약간의 지연을 두어 모달이 먼저 렌더링되도록 함
          setTimeout(() => {
            const element = fieldRef.current;
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              // 필드에 포커스 (가능한 경우)
              if (element instanceof HTMLInputElement || 
                  element instanceof HTMLSelectElement) {
                element.focus();
              }
            }
          }, 100);
        }
      }
    }
  }, [isOpen, errors, fieldRefs]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // 확인 버튼 클릭 시에도 첫 번째 에러 필드로 스크롤
    if (errors.length > 0 && fieldRefs) {
      const firstError = errors[0];
      const fieldId = getFieldId(firstError);
      
      if (fieldId && fieldRefs.has(fieldId)) {
        const fieldRef = fieldRefs.get(fieldId);
        if (fieldRef?.current) {
          const element = fieldRef.current;
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          if (element instanceof HTMLInputElement || 
              element instanceof HTMLSelectElement) {
            element.focus();
          }
        }
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 - 더 어둡고 명확하게 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 모달 컨테이너 - 애니메이션과 더 뚜렷한 그림자 */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full mx-auto max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* 헤더 영역 - 명확한 구분 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* 아이콘 */}
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 ring-4 ring-yellow-50">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              
              {/* 제목 */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {title}
                </h3>
              </div>
            </div>
            
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 메시지 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          <ul className="space-y-2.5">
            {errors.map((error, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"
              >
                <span className="flex-shrink-0 mt-0.5 text-red-500 font-semibold">•</span>
                <span className="flex-1">{error}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 푸터 영역 - 명확한 구분 */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleConfirm}
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
