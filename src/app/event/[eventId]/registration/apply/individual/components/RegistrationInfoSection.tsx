// 신청 정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import Dropdown from '../../shared/components/Dropdown';
import { IndividualFormData, OpenDropdown } from '../../shared/types/individual';
import { EventRegistrationInfo } from '../../shared/types/common';

interface RegistrationInfoSectionProps {
  formData: IndividualFormData;
  eventInfo: EventRegistrationInfo | null;
  openDropdown: OpenDropdown;
  onInputChange: (field: keyof IndividualFormData, value: string) => void;
  onDropdownToggle: (dropdown: OpenDropdown) => void;
  refs: {
    categoryRef: React.RefObject<HTMLDivElement>;
    souvenirRef: React.RefObject<HTMLDivElement>;
    sizeRef: React.RefObject<HTMLDivElement>;
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
                  onInputChange('souvenir', ''); // 카테고리 변경 시 기념품 초기화
                  onInputChange('size', ''); // 카테고리 변경 시 사이즈도 초기화
                }}
                className="w-full"
                disabled={!eventInfo}
              />
            </div>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 기념품 */}
        <FormField label="기념품" required>
          <div className="flex-1 max-w-md">
            <div className="relative" ref={refs.souvenirRef}>
              <Dropdown
                value={formData.souvenir}
                placeholder={
                  !eventInfo ? "로딩 중..." :
                  !formData.category ? "참가종목을 먼저 선택해주세요" :
                  "기념품을 선택해주세요"
                }
                options={souvenirOptions}
                isOpen={openDropdown === 'souvenir'}
                onToggle={() => onDropdownToggle(openDropdown === 'souvenir' ? null : 'souvenir')}
                onSelect={(value) => {
                  onInputChange('souvenir', value);
                  onInputChange('size', ''); // 기념품 변경 시 사이즈 초기화
                }}
                className="w-full"
                disabled={!formData.category || !eventInfo}
              />
            </div>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 사이즈 */}
        <FormField label="사이즈" required>
          <div className="flex-1 max-w-md">
            <div className="relative" ref={refs.sizeRef}>
              <Dropdown
                value={formData.size}
                placeholder={
                  !formData.souvenir ? "기념품을 먼저 선택해주세요" :
                  "사이즈를 선택해주세요"
                }
                options={sizeOptions}
                isOpen={openDropdown === 'size'}
                onToggle={() => onDropdownToggle(openDropdown === 'size' ? null : 'size')}
                onSelect={(value) => onInputChange('size', value)}
                className="w-full"
                disabled={!formData.souvenir}
              />
            </div>
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
    </div>
  );
}
