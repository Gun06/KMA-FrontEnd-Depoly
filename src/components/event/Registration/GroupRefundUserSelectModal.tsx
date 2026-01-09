"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InnerUserRegistration, SouvenirInfo } from '@/app/event/[eventId]/registration/confirm/group/result/types';

interface GroupRefundUserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: InnerUserRegistration[];
  onConfirm: (selectedRegistrationIds: string[]) => void;
}

export default function GroupRefundUserSelectModal({
  isOpen,
  onClose,
  participants,
  onConfirm,
}: GroupRefundUserSelectModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 결제 완료 상태의 참가자만 필터링
  const eligibleParticipants = participants.filter(
    (participant) =>
      participant.paymentStatus === 'COMPLETED' || participant.paymentStatus === 'PAID'
  );

  // 모달이 열릴 때마다 선택 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const handleToggleSelect = (registrationId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(registrationId)) {
        newSet.delete(registrationId);
      } else {
        newSet.add(registrationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === eligibleParticipants.length) {
      // 모두 선택되어 있으면 모두 해제
      setSelectedIds(new Set());
    } else {
      // 모두 선택
      setSelectedIds(new Set(eligibleParticipants.map((p) => p.registrationId)));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) {
      return;
    }
    onConfirm(Array.from(selectedIds));
  };

  // 기념품 정보 포맷팅
  const formatSouvenir = (souvenir: SouvenirInfo[]) => {
    if (!souvenir || souvenir.length === 0) {
      return '없음';
    }
    return souvenir
      .map((item) => {
        const size = item.souvenirSize === '사이즈 없음' || item.souvenirSize === '기념품 없음' 
          ? '' 
          : ` (${item.souvenirSize})`;
        const name = item.souvenirName === '기념품 없음' ? '없음' : item.souvenirName;
        return `${name}${size}`;
      })
      .join(', ');
  };

  // 종목 정보 포맷팅
  const formatEventCategory = (categoryName: string) => {
    if (!categoryName) return '-';
    const parts = categoryName.split('|').map((p) => p.trim());
    return parts[0] || '-';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-none">환불할 참가자 선택</h2>
            <p className="text-sm text-gray-600 mt-1">
              결제 완료 상태의 참가자만 환불 신청이 가능합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 참가자 목록 */}
        <div className="flex-1 overflow-y-auto mb-4">
          {eligibleParticipants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              환불 가능한 참가자가 없습니다.
              <br />
              결제 완료 상태의 참가자만 환불 신청이 가능합니다.
            </div>
          ) : (
            <>
              {/* 전체 선택 */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === eligibleParticipants.length && eligibleParticipants.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    전체 선택 ({selectedIds.size}/{eligibleParticipants.length})
                  </span>
                </label>
              </div>

              {/* 참가자 목록 */}
              <div className="space-y-3">
                {eligibleParticipants.map((participant) => {
                  const isSelected = selectedIds.has(participant.registrationId);
                  return (
                    <div
                      key={participant.registrationId}
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(participant.registrationId)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">이름:</span>
                              <span className="ml-2 font-semibold text-gray-900">{participant.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">생년월일:</span>
                              <span className="ml-2 font-semibold text-gray-900">{participant.birth}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">전화번호:</span>
                              <span className="ml-2 font-semibold text-gray-900">{participant.phNum}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">종목:</span>
                              <span className="ml-2 font-semibold text-gray-900">
                                {formatEventCategory(participant.eventCategoryName)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">기념품:</span>
                              <span className="ml-2 font-semibold text-gray-900">
                                {formatSouvenir(participant.souvenir || [])}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">가격:</span>
                              <span className="ml-2 font-semibold text-blue-600">
                                {participant.amount.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            환불 신청 ({selectedIds.size}명)
          </button>
        </div>
      </div>
    </div>
  );
}

