// 신청 정보 섹션 컴포넌트
import React, { useState, useCallback, useMemo } from 'react';
import FormField from '../../shared/components/FormField';
import { IndividualFormData, OpenDropdown } from '../../shared/types/individual';
import { EventRegistrationInfo } from '../../shared/types/common';
import SouvenirSelectionModal from '@/components/event/GroupRegistration/Modal/SouvenirSelectionModal';

interface RegistrationInfoSectionProps {
  formData: IndividualFormData;
  eventInfo: EventRegistrationInfo | null;
  openDropdown: OpenDropdown;
  onInputChange: (field: keyof IndividualFormData, value: string | Array<{souvenirId: string, souvenirName: string, size: string}>) => void;
  onDropdownToggle: (dropdown: OpenDropdown) => void;
  refs: {
    categoryRef: React.RefObject<HTMLDivElement>;
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

  // 거리 목록 추출 (distances 배열 또는 categorySouvenirList에서 distance 추출)
  const distances = useMemo(() => {
    if (!eventInfo) return [];
    
    // distances 배열이 있으면 사용
    if (eventInfo.distances && eventInfo.distances.length > 0) {
      return eventInfo.distances;
    }
    
    // categorySouvenirList에서 distance 추출하여 중복 제거
    const distanceSet = new Set<string>();
    eventInfo.categorySouvenirList.forEach(category => {
      if (category.distance) {
        distanceSet.add(category.distance);
      }
    });
    return Array.from(distanceSet).sort();
  }, [eventInfo]);

  // 선택된 거리의 세부종목 목록
  const categoriesByDistance = useMemo(() => {
    if (!formData.selectedDistance || !eventInfo) return [];
    
    return eventInfo.categorySouvenirList.filter(
      category => category.distance === formData.selectedDistance
    );
  }, [formData.selectedDistance, eventInfo]);

  // 선택된 세부종목 정보 (거리와 세부종목 이름을 함께 고려)
  const selectedCategory = useMemo(() => {
    if (!formData.category || !eventInfo) return null;
    
    // 거리와 세부종목 이름을 함께 매칭 (같은 이름의 세부종목이 여러 거리에 있을 수 있음)
    if (formData.selectedDistance) {
      const matched = eventInfo.categorySouvenirList.find(
        c => c.categoryName === formData.category && c.distance === formData.selectedDistance
      );
      if (matched) return matched;
    }
    
    // 거리가 없거나 매칭되지 않은 경우, 이름만으로 찾기 (하위 호환성)
    return eventInfo.categorySouvenirList.find(
      c => c.categoryName === formData.category
    ) || null;
  }, [formData.category, formData.selectedDistance, eventInfo]);

  // 거리 선택 핸들러
  const handleDistanceSelect = useCallback((distance: string) => {
    onInputChange('selectedDistance', distance);
    // 거리 변경 시 세부종목과 기념품 초기화
    onInputChange('category', '');
    onInputChange('selectedSouvenirs', []);
    onInputChange('souvenir', '');
    onInputChange('size', '');
  }, [onInputChange]);

  // 세부종목 선택 핸들러
  const handleCategorySelect = useCallback((categoryName: string) => {
    onInputChange('category', categoryName);
    // 세부종목 변경 시 기념품 초기화
    onInputChange('selectedSouvenirs', []);
    onInputChange('souvenir', '');
    onInputChange('size', '');
  }, [onInputChange]);

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

  // 현재 표시할 우측 리스트 상태 결정
  const rightListMode = useMemo(() => {
    if (!formData.selectedDistance) return 'empty';
    return 'categories';
  }, [formData.selectedDistance]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">신청 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 거리 및 세부종목 선택 */}
        <FormField label="참가종목" required>
          <div className="flex-1 min-w-0">
            <div className="flex border border-gray-200 rounded-lg bg-white overflow-hidden max-w-xl">
              {/* 좌측: 거리 리스트 */}
              <div className="flex-shrink-0 w-36 border-r border-gray-200 flex flex-col">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">거리</div>
                </div>
                <div 
                  className="p-2 h-[150px] overflow-y-auto bg-white"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb #f9fafb'
                  }}
                >
                  {!eventInfo ? (
                    <div className="text-sm text-gray-400 py-4 text-center">로딩 중...</div>
                  ) : distances.length === 0 ? (
                    <div className="text-sm text-gray-400 py-4 text-center">거리 정보가 없습니다</div>
                  ) : (
                    <div className="space-y-0">
                      {distances.map((distance) => (
                        <button
                          key={distance}
                          type="button"
                          onClick={() => handleDistanceSelect(distance)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            formData.selectedDistance === distance
                              ? 'bg-blue-500 text-white font-medium'
                              : 'bg-white text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {distance}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 우측: 세부종목 리스트 */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">세부종목</div>
                </div>
                <div 
                  className="p-2 h-[150px] overflow-y-auto bg-white"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb #f9fafb'
                  }}
                >
                  {rightListMode === 'empty' ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-sm text-gray-400">거리를 선택해주세요</div>
                    </div>
                  ) : categoriesByDistance.length === 0 ? (
                    <div className="text-sm text-gray-400 py-4 text-center">세부종목이 없습니다</div>
                  ) : (
                    <div className="space-y-0">
                      {categoriesByDistance.map((category) => (
                        <button
                          key={category.categoryId}
                          type="button"
                          onClick={() => handleCategorySelect(category.categoryName)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            formData.category === category.categoryName
                              ? 'bg-blue-500 text-white font-medium'
                              : 'bg-white text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {category.categoryName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 기념품 선택 */}
        <FormField label="기념품" required>
          <div className="flex-1 min-w-0 max-w-xl">
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
        distance={formData.selectedDistance}
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
                // 거리와 세부종목 이름을 함께 고려해서 찾기
                const selectedCategory = eventInfo.categorySouvenirList.find(c => {
                  if (formData.selectedDistance) {
                    return c.categoryName === formData.category && c.distance === formData.selectedDistance;
                  }
                  return c.categoryName === formData.category;
                });
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
