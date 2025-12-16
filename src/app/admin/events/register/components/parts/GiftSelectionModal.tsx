'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

type GiftItem = { name: string; size: string };

type GiftSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIndices: number[]) => void;
  availableGifts: GiftItem[];
  selectedIndices: number[]; // 현재 선택된 기념품 인덱스 배열
};

export default function GiftSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  availableGifts,
  selectedIndices,
}: GiftSelectionModalProps) {
  const [tempSelected, setTempSelected] = useState<number[]>([]);

  // 모달이 열릴 때 현재 선택된 기념품으로 초기화
  useEffect(() => {
    if (isOpen) {
      setTempSelected([...selectedIndices]);
    }
  }, [isOpen, selectedIndices]);

  if (!isOpen) return null;

  const handleToggle = (index: number) => {
    setTempSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">기념품 선택</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {availableGifts.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-500">
              등록된 기념품이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {availableGifts.map((gift, index) => {
                const isSelected = tempSelected.includes(index);
                return (
                  <label
                    key={index}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md border cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(index)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-neutral-700 flex-1">
                      {gift.name} {gift.size && `(${gift.size})`}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
