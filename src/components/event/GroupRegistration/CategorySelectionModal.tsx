"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { EventRegistrationInfo } from '@/app/event/[eventId]/registration/apply/shared/types/common';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (distance: string, categoryName: string) => void;
  eventInfo: EventRegistrationInfo | null;
  currentDistance?: string;
  currentCategory?: string;
}

export default function CategorySelectionModal({
  isOpen,
  onClose,
  onConfirm,
  eventInfo,
  currentDistance = '',
  currentCategory = ''
}: CategorySelectionModalProps) {
  const [selectedDistance, setSelectedDistance] = useState<string>(currentDistance);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);

  // 모달이 열릴 때 현재 선택값으로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedDistance(currentDistance);
      setSelectedCategory(currentCategory);
    }
  }, [isOpen, currentDistance, currentCategory]);

  // 거리 목록 추출
  const distances = useMemo(() => {
    if (!eventInfo) return [];
    
    if (eventInfo.distances && eventInfo.distances.length > 0) {
      return eventInfo.distances;
    }
    
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
    if (!selectedDistance || !eventInfo) return [];
    
    return eventInfo.categorySouvenirList.filter(
      category => category.distance === selectedDistance
    );
  }, [selectedDistance, eventInfo]);

  // 거리 선택 핸들러
  const handleDistanceSelect = (distance: string) => {
    setSelectedDistance(distance);
    setSelectedCategory(''); // 거리 변경 시 세부종목 초기화
  };

  // 세부종목 선택 핸들러
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    if (selectedDistance && selectedCategory) {
      onConfirm(selectedDistance, selectedCategory);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">참가종목 선택</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="flex border border-gray-200 rounded-lg bg-white overflow-hidden">
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
                          selectedDistance === distance
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
                {!selectedDistance ? (
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
                          selectedCategory === category.categoryName
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

        {/* 푸터 */}
        <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDistance || !selectedCategory}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              selectedDistance && selectedCategory
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

