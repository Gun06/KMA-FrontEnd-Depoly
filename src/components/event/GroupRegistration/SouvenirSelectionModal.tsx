"use client";

import React, { useState, useEffect } from 'react';
import { EventRegistrationInfo } from '@/app/event/[eventId]/registration/apply/shared/types/common';

interface SouvenirSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>) => void;
  categoryName: string;
  distance?: string; // 거리 정보 추가
  eventInfo: EventRegistrationInfo | null;
  currentSelection: Array<{souvenirId: string, souvenirName: string, size: string}>;
}

export default function SouvenirSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  distance,
  eventInfo,
  currentSelection
}: SouvenirSelectionModalProps) {
  const [selectedSouvenirs, setSelectedSouvenirs] = useState<Array<{souvenirId: string, souvenirName: string, size: string}>>(currentSelection);

  useEffect(() => {
    // 모달이 열릴 때, 실제 기념품이 1개 이상 있으면 모두 자동 선택
    if (isOpen && eventInfo) {
      // 거리와 세부종목 이름을 함께 고려해서 찾기
      const selectedCategory = eventInfo.categorySouvenirList.find(c => {
        if (distance) {
          return c.categoryName === categoryName && c.distance === distance;
        }
        return c.categoryName === categoryName;
      });
      const availableSouvenirs = selectedCategory?.categorySouvenirPair || [];
      
      // "기념품 없음"을 제외한 실제 기념품 목록
      const actualSouvenirs = availableSouvenirs.filter(souvenir => {
        const isNoSouvenir = souvenir.souvenirName === '기념품 없음' || 
                            souvenir.souvenirId === '0' || 
                            souvenir.souvenirId === '1' || 
                            souvenir.souvenirId === '2';
        return !isNoSouvenir;
      });

      // 실제 기념품이 1개 이상 있는 경우, 모두 필수 선택
      if (actualSouvenirs.length >= 1) {
        // 모든 실제 기념품을 자동으로 선택 (이미 선택된 것은 유지, 없는 것은 추가)
        const autoSelected = actualSouvenirs.map(souvenir => {
          const existing = currentSelection.find(s => s.souvenirId === souvenir.souvenirId);
          if (existing) {
            // 이미 선택된 경우, 사이즈가 없으면 기본 사이즈 설정
            if (!existing.size && souvenir.souvenirSize && souvenir.souvenirSize.length > 0) {
              return {
                ...existing,
                size: souvenir.souvenirSize[0]
              };
            }
            return existing;
          }
          // 첫 번째 사이즈를 자동으로 선택
          const defaultSize = souvenir.souvenirSize?.[0] || '';
          return { 
            souvenirId: souvenir.souvenirId, 
            souvenirName: souvenir.souvenirName, 
            size: defaultSize 
          };
        });
        
        // 기존 선택에 "기념품 없음"이 있으면 유지
        const noSouvenirItems = currentSelection.filter(s => {
          const souvenir = availableSouvenirs.find(a => a.souvenirId === s.souvenirId);
          if (!souvenir) return false;
          return souvenir.souvenirName === '기념품 없음' || 
                 souvenir.souvenirId === '0' || 
                 souvenir.souvenirId === '1' || 
                 souvenir.souvenirId === '2';
        });
        
        setSelectedSouvenirs([...autoSelected, ...noSouvenirItems]);
      } else {
        // 기념품이 없는 경우 기존 선택 유지
        setSelectedSouvenirs(currentSelection);
      }
    } else {
      setSelectedSouvenirs(currentSelection);
    }
  }, [currentSelection, isOpen, eventInfo, categoryName, distance]);

  if (!isOpen) return null;

  // 거리와 세부종목 이름을 함께 고려해서 찾기
  const selectedCategory = eventInfo?.categorySouvenirList.find(c => {
    if (distance) {
      return c.categoryName === categoryName && c.distance === distance;
    }
    return c.categoryName === categoryName;
  });
  const availableSouvenirs = selectedCategory?.categorySouvenirPair || [];

  const handleSouvenirToggle = (souvenirId: string, souvenirName: string) => {
    // "기념품 없음"을 제외한 실제 기념품 목록
    const actualSouvenirs = availableSouvenirs.filter(souvenir => {
      const isNoSouvenir = souvenir.souvenirName === '기념품 없음' || 
                          souvenir.souvenirId === '0' || 
                          souvenir.souvenirId === '1' || 
                          souvenir.souvenirId === '2';
      return !isNoSouvenir;
    });

    // 실제 기념품이 1개 이상 있는 경우, 이미 선택된 항목은 해제할 수 없음 (모두 필수 선택)
    if (actualSouvenirs.length >= 1) {
      const existing = selectedSouvenirs.find(s => s.souvenirId === souvenirId);
      if (existing) {
        // 이미 선택된 경우 - 해제 불가 (모두 선택 필수)
        return;
      }
    }

    setSelectedSouvenirs(prev => {
      const existing = prev.find(s => s.souvenirId === souvenirId);
      if (existing) {
        // 이미 선택된 경우 제거 (기념품이 1개 이하인 경우에만 허용)
        return prev.filter(s => s.souvenirId !== souvenirId);
      } else {
        // 새로 선택하는 경우 - 첫 번째 사이즈를 자동으로 선택
        const souvenir = availableSouvenirs.find(s => s.souvenirId === souvenirId);
        const defaultSize = souvenir?.souvenirSize?.[0] || '';
        return [...prev, { souvenirId, souvenirName, size: defaultSize }];
      }
    });
  };

  const handleSizeChange = (souvenirId: string, size: string) => {
    // 사이즈는 항상 변경 가능
    setSelectedSouvenirs(prev => 
      prev.map(s => 
        s.souvenirId === souvenirId 
          ? { ...s, size } 
          : s
      )
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedSouvenirs);
    onClose();
  };

  const isSouvenirSelected = (souvenirId: string) => {
    return selectedSouvenirs.some(s => s.souvenirId === souvenirId);
  };

  const getSelectedSouvenir = (souvenirId: string) => {
    return selectedSouvenirs.find(s => s.souvenirId === souvenirId);
  };

  // 확인 버튼 활성화 여부 체크
  const isConfirmEnabled = () => {
    // 기념품을 하나도 선택하지 않으면 비활성화
    if (selectedSouvenirs.length === 0) {
      return false;
    }

    // "기념품 없음"을 제외한 실제 기념품 목록
    const actualSouvenirs = availableSouvenirs.filter(souvenir => {
      const isNoSouvenir = souvenir.souvenirName === '기념품 없음' || 
                          souvenir.souvenirId === '0' || 
                          souvenir.souvenirId === '1' || 
                          souvenir.souvenirId === '2';
      return !isNoSouvenir;
    });

    // 실제 기념품이 없으면 (기념품 없음만 있는 경우) 하나 이상 선택하면 통과
    if (actualSouvenirs.length === 0) {
      return selectedSouvenirs.length > 0;
    }

    // 실제 기념품이 1개 이상 있는 경우, 모두 선택되어야 함
    if (actualSouvenirs.length >= 1) {
      // 모든 실제 기념품이 선택되었는지 확인
      const allSelected = actualSouvenirs.every(souvenir => 
        selectedSouvenirs.some(selected => selected.souvenirId === souvenir.souvenirId)
      );

      if (!allSelected) {
        return false;
      }
    }

    // 모든 선택된 기념품이 유효한 사이즈를 가지고 있는지 확인
    return selectedSouvenirs.every(selected => {
      const souvenir = availableSouvenirs.find(s => s.souvenirId === selected.souvenirId);
      if (!souvenir) return false;

      // 기념품 없음이거나 사이즈가 없는 경우는 통과
      const isNoSouvenir = souvenir.souvenirName === '기념품 없음' || 
                          souvenir.souvenirId === '0' || 
                          souvenir.souvenirId === '1' || 
                          souvenir.souvenirId === '2';
      
      if (isNoSouvenir || !souvenir.souvenirSize || souvenir.souvenirSize.length === 0) {
        return true;
      }

      // 사이즈가 있는 경우 유효한 사이즈가 선택되어 있어야 함
      return selected.size && selected.size !== '';
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">기념품 선택</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {(() => {
              const actualSouvenirs = availableSouvenirs.filter(souvenir => {
                const isNoSouvenir = souvenir.souvenirName === '기념품 없음' || 
                                    souvenir.souvenirId === '0' || 
                                    souvenir.souvenirId === '1' || 
                                    souvenir.souvenirId === '2';
                return !isNoSouvenir;
              });

              if (actualSouvenirs.length >= 1) {
                return (
                  <>
                    <strong>{categoryName}</strong> 종목의 기념품 {actualSouvenirs.length === 1 ? '1개를' : `${actualSouvenirs.length}개를 모두`} 선택해야 합니다. (사이즈는 본인이 선택할 수 있습니다)
                  </>
                );
              } else {
                return (
                  <>
                    <strong>{categoryName}</strong> 종목의 기념품을 선택해주세요.
                  </>
                );
              }
            })()}
          </p>
        </div>

        <div className="space-y-4">
          {availableSouvenirs.map((souvenir) => {
            const isSelected = isSouvenirSelected(souvenir.souvenirId);
            const selectedSouvenir = getSelectedSouvenir(souvenir.souvenirId);
            const isNoSouvenir = souvenir.souvenirName === '기념품 없음' || 
                                souvenir.souvenirId === '0' || 
                                souvenir.souvenirId === '1' || 
                                souvenir.souvenirId === '2';

            // "기념품 없음"을 제외한 실제 기념품 목록
            const actualSouvenirs = availableSouvenirs.filter(s => {
              const isNoSouvenirItem = s.souvenirName === '기념품 없음' || 
                                      s.souvenirId === '0' || 
                                      s.souvenirId === '1' || 
                                      s.souvenirId === '2';
              return !isNoSouvenirItem;
            });

            // 실제 기념품이 1개 이상 있고, 현재 기념품이 실제 기념품인 경우 체크박스만 비활성화 (사이즈는 선택 가능)
            const isMultipleRequired = actualSouvenirs.length >= 1 && !isNoSouvenir;
            const isCheckboxDisabled = isMultipleRequired && isSelected;

            return (
              <div
                key={souvenir.souvenirId}
                className={`border rounded-lg p-4 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id={`souvenir-${souvenir.souvenirId}`}
                      checked={isSelected}
                      onChange={() => handleSouvenirToggle(souvenir.souvenirId, souvenir.souvenirName)}
                      disabled={isCheckboxDisabled}
                      className={`appearance-none w-4 h-4 border-2 rounded ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      } ${
                        isCheckboxDisabled 
                          ? 'cursor-not-allowed' 
                          : 'cursor-pointer hover:border-blue-400'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors`}
                    />
                    {isSelected && (
                      <svg
                        className={`absolute left-0.5 top-0.5 w-3 h-3 pointer-events-none ${
                          isCheckboxDisabled ? 'text-white' : 'text-white'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <label
                    htmlFor={`souvenir-${souvenir.souvenirId}`}
                    className={`flex-1 ${isCheckboxDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-medium text-gray-900">
                      {souvenir.souvenirName}
                    </div>
                  </label>
                </div>

                {/* 사이즈 선택 (기념품이 선택되었고, 기념품 없음이 아닌 경우에만 표시) */}
                {isSelected && !isNoSouvenir && souvenir.souvenirSize && souvenir.souvenirSize.length > 0 && (
                  <div className="mt-3 ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사이즈 선택
                    </label>
                    <select
                      value={selectedSouvenir?.size || ''}
                      onChange={(e) => handleSizeChange(souvenir.souvenirId, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {souvenir.souvenirSize.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled()}
            className={`px-4 py-2 rounded-md transition-colors ${
              isConfirmEnabled()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            확인 ({selectedSouvenirs.length}개 선택됨)
          </button>
        </div>
      </div>
    </div>
  );
}
