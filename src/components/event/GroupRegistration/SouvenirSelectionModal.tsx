"use client";

import React, { useState, useEffect } from 'react';
import { EventRegistrationInfo } from '@/app/event/[eventId]/registration/apply/shared/types/common';

interface SouvenirSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>) => void;
  categoryName: string;
  eventInfo: EventRegistrationInfo | null;
  currentSelection: Array<{souvenirId: string, souvenirName: string, size: string}>;
}

export default function SouvenirSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  eventInfo,
  currentSelection
}: SouvenirSelectionModalProps) {
  const [selectedSouvenirs, setSelectedSouvenirs] = useState<Array<{souvenirId: string, souvenirName: string, size: string}>>(currentSelection);

  useEffect(() => {
    setSelectedSouvenirs(currentSelection);
  }, [currentSelection]);

  if (!isOpen) return null;

  const selectedCategory = eventInfo?.categorySouvenirList.find(c => c.categoryName === categoryName);
  const availableSouvenirs = selectedCategory?.categorySouvenirPair || [];

  const handleSouvenirToggle = (souvenirId: string, souvenirName: string) => {
    setSelectedSouvenirs(prev => {
      const existing = prev.find(s => s.souvenirId === souvenirId);
      if (existing) {
        // 이미 선택된 경우 제거
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
            <strong>{categoryName}</strong> 종목의 기념품을 선택해주세요. (여러개 선택 가능)
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
                  <input
                    type="checkbox"
                    id={`souvenir-${souvenir.souvenirId}`}
                    checked={isSelected}
                    onChange={() => handleSouvenirToggle(souvenir.souvenirId, souvenir.souvenirName)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`souvenir-${souvenir.souvenirId}`}
                    className="flex-1 cursor-pointer"
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
