"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EventRegistrationInfo } from '@/app/event/[eventId]/registration/apply/shared/types/common';
import { stripClosureSuffix } from '../utils/participantHelpers';

export type CategorySelectionResult = {
  distance: string;
  categoryName: string;
  categoryId: string;
};

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: CategorySelectionResult) => void;
  eventInfo: EventRegistrationInfo | null;
  currentDistance?: string;
  currentCategory?: string;
  currentCategoryId?: string;
}

export default function CategorySelectionModal({
  isOpen,
  onClose,
  onConfirm,
  eventInfo,
  currentDistance = '',
  currentCategory = '',
  currentCategoryId = ''
}: CategorySelectionModalProps) {
  const [selectedDistance, setSelectedDistance] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const normalizeDistance = (a: string, b: string) =>
    a.trim().toLowerCase() === b.trim().toLowerCase();

  // 모달이 열릴 때만 현재 선택값으로 초기화 (열린 상태에서 클릭한 거리 선택 유지)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      let distance = stripClosureSuffix(String(currentDistance || '').trim());
      let category = stripClosureSuffix(String(currentCategory || '').trim());
      let categoryId = String(currentCategoryId || '').trim();

      if (eventInfo && categoryId && (!distance || !category)) {
        const matched = eventInfo.categorySouvenirList.find((c) => c.categoryId === categoryId);
        if (matched) {
          distance = distance || stripClosureSuffix(matched.distance);
          category = category || stripClosureSuffix(matched.categoryName);
        }
      }

      setSelectedDistance(distance);
      setSelectedCategory(category);
      setSelectedCategoryId(categoryId);
    }

    if (!isOpen) {
      setSelectedDistance('');
      setSelectedCategory('');
      setSelectedCategoryId('');
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, currentDistance, currentCategory, currentCategoryId, eventInfo]);

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

    return eventInfo.categorySouvenirList.filter((category) =>
      normalizeDistance(category.distance, selectedDistance)
    );
  }, [selectedDistance, eventInfo]);

  // 거리 선택 핸들러
  const handleDistanceSelect = (distance: string) => {
    setSelectedDistance(distance);
    // 거리 변경 시 세부종목 초기화 (사용자가 직접 클릭한 경우)
    // 단, 현재 선택된 세부종목이 새로운 거리에도 존재하면 유지
    const newCategories =
      eventInfo?.categorySouvenirList.filter((c) => normalizeDistance(c.distance, distance)) || [];
    const matched = newCategories.find(
      (c) => stripClosureSuffix(c.categoryName) === stripClosureSuffix(selectedCategory)
    );
    if (!matched) {
      setSelectedCategory('');
      setSelectedCategoryId('');
    } else {
      setSelectedCategoryId(matched.categoryId);
    }
  };

  // 세부종목 선택 핸들러
  const handleCategorySelect = (categoryName: string, categoryId: string) => {
    setSelectedCategory(categoryName);
    setSelectedCategoryId(categoryId);
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    if (selectedDistance && selectedCategory && selectedCategoryId) {
      onConfirm({
        distance: selectedDistance,
        categoryName: selectedCategory,
        categoryId: selectedCategoryId,
      });
      onClose();
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] flex flex-col">
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
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${normalizeDistance(selectedDistance, distance)
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
                    {categoriesByDistance.map((category) => {
                      const isCategoryActive = category.isActive !== false; // 기본값은 true
                      // 기념품 중 하나라도 isActive: false가 있으면 종목 비활성화
                      const hasInactiveSouvenir = category.categorySouvenirPair?.some(
                        souvenir => souvenir.isActive === false
                      ) || false;
                      const isActive = isCategoryActive && !hasInactiveSouvenir;
                      const displayName = stripClosureSuffix(category.categoryName);
                      return (
                        <button
                          key={category.categoryId}
                          type="button"
                          onClick={() => isActive && handleCategorySelect(displayName, category.categoryId)}
                          disabled={!isActive}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            !isActive
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                              : selectedCategory === displayName
                              ? 'bg-blue-500 text-white font-medium'
                              : 'bg-white text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {displayName}
                          {!isCategoryActive && ' (마감)'}
                          {isCategoryActive && hasInactiveSouvenir && ' (기념품 마감)'}
                        </button>
                      );
                    })}
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
            disabled={!selectedDistance || !selectedCategory || !selectedCategoryId}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${selectedDistance && selectedCategory && selectedCategoryId
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

