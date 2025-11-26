// 신청 정보 섹션 컴포넌트
import React, { useState, useCallback } from 'react';
import FormField from '../../shared/components/FormField';
import Dropdown from '../../shared/components/Dropdown';
import { IndividualFormData, OpenDropdown } from '../../shared/types/individual';
import { EventRegistrationInfo } from '../../shared/types/common';
import SouvenirSelectionModal from '@/components/event/GroupRegistration/SouvenirSelectionModal';

interface RegistrationInfoSectionProps {
  formData: IndividualFormData;
  eventInfo: EventRegistrationInfo | null;
  openDropdown: OpenDropdown;
  onInputChange: (field: keyof IndividualFormData, value: string | Array<{souvenirId: string, souvenirName: string, size: string}>) => void;
  onDropdownToggle: (dropdown: OpenDropdown) => void;
  refs: {
    categoryRef: React.RefObject<HTMLDivElement>;
    // souvenirRef: React.RefObject<HTMLDivElement>; // 기념품 선택 모달로 변경
    // sizeRef: React.RefObject<HTMLDivElement>; // 기념품 선택 모달로 변경
  };
}

export default function RegistrationInfoSection({
  formData,
  eventInfo,
  openDropdown,
  onInputChange,
  onDropdownToggle,
  refs
}: RegistrationInfoSectionProps) {
  const [isSouvenirModalOpen, setIsSouvenirModalOpen] = useState(false);

  // 기념품 선택 모달 열기
  const handleOpenSouvenirModal = useCallback(() => {
    if (!formData.category || !eventInfo) {
      return;
    }
    setIsSouvenirModalOpen(true);
  }, [formData.category, eventInfo]);

  // 기념품 선택 모달 닫기
  const handleCloseSouvenirModal = useCallback(() => {
    setIsSouvenirModalOpen(false);
  }, []);

  // 기념품 선택 확인
  const handleConfirmSouvenirSelection = useCallback((selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>) => {
    // 여러 기념품을 selectedSouvenirs에 저장
    onInputChange('selectedSouvenirs', selectedSouvenirs);
    
    // 기존 호환성을 위해 첫 번째 기념품을 souvenir와 size에 저장
    const firstSouvenir = selectedSouvenirs[0];
    if (firstSouvenir) {
      onInputChange('souvenir', firstSouvenir.souvenirId);
      onInputChange('size', firstSouvenir.size);
    } else {
      onInputChange('souvenir', '');
      onInputChange('size', '');
    }
    
    handleCloseSouvenirModal();
  }, [onInputChange, handleCloseSouvenirModal]);

  // 카테고리 옵션 생성
  const categoryOptions = eventInfo?.categorySouvenirList.map(category => ({
    value: category.categoryName,
    label: category.categoryName
  })) || [];

  // 기념품 옵션 생성
  const souvenirOptions = formData.category && eventInfo
    ? eventInfo.categorySouvenirList
        .find(c => c.categoryName === formData.category)
        ?.categorySouvenirPair.map(souvenir => ({
          value: souvenir.souvenirId,
          label: souvenir.souvenirName
        })) || []
    : [];

  // 선택된 기념품 정보
  const selectedSouvenir = formData.souvenir && eventInfo
    ? eventInfo.categorySouvenirList
        .find(c => c.categoryName === formData.category)
        ?.categorySouvenirPair.find(s => s.souvenirId === formData.souvenir)
    : null;

  // 선택된 카테고리 정보
  const selectedCategory = formData.category && eventInfo
    ? eventInfo.categorySouvenirList.find(c => c.categoryName === formData.category)
    : null;

  // 사이즈 옵션 생성 (선택된 기념품의 사이즈 배열 사용)
  const sizeOptions = selectedSouvenir?.souvenirSize?.map(size => ({
    value: size,
    label: size
  })) || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">신청 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 참가종목 */}
        <FormField label="참가종목" required>
          <div className="flex-1 max-w-md">
            <div className="relative" ref={refs.categoryRef}>
              <Dropdown
                value={formData.category}
                placeholder={!eventInfo ? "로딩 중..." : "참가종목을 선택해주세요"}
                options={categoryOptions}
                isOpen={openDropdown === 'category'}
                onToggle={() => onDropdownToggle(openDropdown === 'category' ? null : 'category')}
                onSelect={(value) => {
                  onInputChange('category', value);
                }}
                className="w-full"
                disabled={!eventInfo}
              />
            </div>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 기념품 선택 */}
        <FormField label="기념품" required>
          <div className="flex-1 max-w-md">
            <button
              type="button"
              onClick={handleOpenSouvenirModal}
              disabled={!formData.category || !eventInfo}
              className={`w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 hover:bg-blue-100 transition-colors text-left font-medium ${
                !formData.category || !eventInfo ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' : 'cursor-pointer hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>
                  {(() => {
                    if (!eventInfo) return "로딩 중...";
                    if (!formData.category) return "참가종목을 먼저 선택해주세요";
                    
                    // 여러 기념품이 선택된 경우
                    if (formData.selectedSouvenirs && formData.selectedSouvenirs.length > 0) {
                      if (formData.selectedSouvenirs.length === 1) {
                        // 하나만 선택된 경우: "기념품명 (사이즈)"
                        const souvenir = formData.selectedSouvenirs[0];
                        return `${souvenir.souvenirName}${souvenir.size ? ` (${souvenir.size})` : ''}`;
                      } else {
                        // 여러 개 선택된 경우: "X개 기념품 선택됨"
                        return `${formData.selectedSouvenirs.length}개 기념품 선택됨`;
                      }
                    }
                    
                    // 기존 방식 (호환성)
                    if (formData.souvenir) {
                      const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === formData.category);
                      if (selectedCategory) {
                        const selectedSouvenirObj = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === formData.souvenir);
                        if (selectedSouvenirObj) {
                          return `${selectedSouvenirObj.souvenirName}${formData.size ? ` (${formData.size})` : ''}`;
                        }
                      }
                    }
                    
                    return "기념품을 선택해주세요";
                  })()}
                </span>
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 참가비 */}
        {formData.category && selectedCategory && (
          <FormField label="참가비">
            <div className="text-lg sm:text-xl font-bold text-orange-600">
              <span className="text-orange-600 font-semibold">
                {selectedCategory.amount.toLocaleString()}원
              </span>
            </div>
          </FormField>
        )}
      </div>

      {/* 기념품 선택 모달 */}
      <SouvenirSelectionModal
        isOpen={isSouvenirModalOpen}
        onClose={handleCloseSouvenirModal}
        onConfirm={handleConfirmSouvenirSelection}
        categoryName={formData.category || ''}
        eventInfo={eventInfo}
        currentSelection={(() => {
          // selectedSouvenirs가 있으면 그것을 사용
          if (formData.selectedSouvenirs && formData.selectedSouvenirs.length > 0) {
            return formData.selectedSouvenirs;
          }
          
          // selectedSouvenirs가 없으면 souvenir로 변환
          if (formData.souvenir) {
            const selection = [{
              souvenirId: formData.souvenir,
              souvenirName: (() => {
                if (!eventInfo || !formData.category) return '';
                const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === formData.category);
                if (selectedCategory) {
                  const selectedSouvenirObj = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === formData.souvenir);
                  return selectedSouvenirObj?.souvenirName || '';
                }
                return '';
              })(),
              size: formData.size || ''
            }];
            
            
            // 비동기적으로 selectedSouvenirs 업데이트
            setTimeout(() => {
              onInputChange('selectedSouvenirs', selection);
            }, 0);
            
            return selection;
          }
          
          return [];
        })()}
      />
    </div>
  );
}
