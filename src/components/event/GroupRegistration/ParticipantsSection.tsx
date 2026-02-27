"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import SouvenirSelectionModal from './Modal/SouvenirSelectionModal';
import CategorySelectionModal from './Modal/CategorySelectionModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import { ParticipantsSectionProps } from './types';
import { useParticipantHandlers } from './hooks/useParticipantHandlers';
import { useModalState } from './hooks/useModalState';
import { useParticipantMemoizedValues } from './hooks/useParticipantMemoizedValues';
import {
  parseCategoryWithDistance,
  formatCategoryWithDistance,
  calculateParticipantFee,
  formatPaymentStatusText,
  getPaymentStatusColorClass,
  getCategoryDisplayText
} from './utils/participantHelpers';
import {
  getSouvenirDisplayText
} from './utils/participantCalculations';

// 툴팁 래퍼 컴포넌트 - fixed positioning으로 overflow 문제 해결
const TooltipWrapper = ({ children, content }: { children: React.ReactElement; content: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.left + rect.width / 2
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    updateTooltipPosition();
    setShowTooltip(true);
  }, [updateTooltipPosition]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  useEffect(() => {
    if (showTooltip) {
      const handleScroll = () => updateTooltipPosition();
      const handleResize = () => updateTooltipPosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showTooltip, updateTooltipPosition]);

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center"
      >
        {children}
      </div>
      {showTooltip && (
        <div
          className="fixed px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-[99999] whitespace-nowrap pointer-events-none"
          style={{
            top: `${tooltipPosition.top - 8}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {content}
          {/* 말풍선 꼬리 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </>
  );
};

const ParticipantsSection = memo(function ParticipantsSection({
  participants,
  eventInfo,
  onParticipantsChange,
  isEditMode = false
}: ParticipantsSectionProps) {
  const [pendingParticipantCount, setPendingParticipantCount] = useState(() => participants.length);
  const [errorModalState, setErrorModalState] = useState({ isOpen: false, message: '' });

  const {
    handleParticipantChange,
    handleParticipantCountChange,
    handleDeleteParticipant,
    handleAddNewParticipant,
    handleDeleteNewParticipant
  } = useParticipantHandlers({
    participants,
    onParticipantsChange,
    isEditMode
  });

  const {
    souvenirModalState,
    categoryModalState,
    confirmModalState,
    setConfirmModalState,
    handleOpenCategoryModal: openCategoryModal,
    handleCloseCategoryModal: closeCategoryModal,
    handleOpenSouvenirModal: openSouvenirModal,
    handleCloseSouvenirModal: closeSouvenirModal
  } = useModalState();

  const { participantDisabledStates } = useParticipantMemoizedValues({
    participants,
    eventInfo
  });

  const existingParticipantsCount = useMemo(() => {
    if (!isEditMode) return 0;
    return participants.filter((participant) => Boolean(participant.registrationId)).length;
  }, [isEditMode, participants]);

  const firstNewParticipantIndex = useMemo(() => {
    if (!isEditMode) return -1;
    return participants.findIndex((participant) => !participant.registrationId);
  }, [isEditMode, participants]);

  useEffect(() => {
    setPendingParticipantCount(participants.length);
  }, [participants.length]);

  // 종목/기념품 변경 불가 상태 확인 (확인필요, 환불요청 상태)
  const isCategorySouvenirDisabled = useCallback((paymentStatus: string | undefined): boolean => {
    if (!paymentStatus) return false;
    // 확인필요, 환불요청(전액/차액) 상태에서는 종목/기념품 변경 불가
    // 결제완료(COMPLETED/PAID)는 종목/기념품 수정 가능
    return paymentStatus === 'MUST_CHECK' || 
           paymentStatus === 'NEED_REFUND' || 
           paymentStatus === 'NEED_PARTITIAL_REFUND';
  }, []);

  // 참가종목 선택 모달 열기 (결제 상태 체크 포함)
  const handleOpenCategoryModal = useCallback((index: number) => {
    const participant = participants[index];
    // 확인필요, 환불요청 상태인 경우 모달을 열 수 없음 (수정 모드 포함)
    // 결제완료(COMPLETED/PAID)는 종목/기념품 수정 가능
    if (isCategorySouvenirDisabled(participant.paymentStatus)) {
      return;
    }
    openCategoryModal(index);
  }, [participants, openCategoryModal, isCategorySouvenirDisabled]);

  // 참가종목 선택 확인
  const handleConfirmCategorySelection = useCallback((distance: string, categoryName: string) => {
    const index = categoryModalState.participantIndex;
    if (index === -1) return;
    
    const participant = participants[index];
    const paymentStatus = participant.paymentStatus?.toUpperCase();
    
    // 확인필요, 환불요청 상태인 경우 변경 불가
    if (isCategorySouvenirDisabled(participant.paymentStatus)) {
      closeCategoryModal();
      return;
    }
    
    // 결제완료 상태에서 동일 금액 체크
    const isCompleted = paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
    if (isCompleted && participant.originalAmount !== undefined) {
      const newCategory = formatCategoryWithDistance(distance, categoryName);
      const newAmount = calculateParticipantFee(newCategory, eventInfo);
      
      // 동일 금액이 아니면 변경 불가
      if (newAmount !== participant.originalAmount) {
        setErrorModalState({
          isOpen: true,
          message: `결제완료 상태에서는 동일 금액(${participant.originalAmount.toLocaleString()}원) 내에서만 종목을 변경할 수 있습니다.`
        });
        closeCategoryModal();
        return;
      }
    }
    
    const categoryWithDistance = formatCategoryWithDistance(distance, categoryName);
    handleParticipantChange(index, 'category', categoryWithDistance);
    closeCategoryModal();
  }, [categoryModalState.participantIndex, handleParticipantChange, closeCategoryModal, participants, isCategorySouvenirDisabled, eventInfo]);

  // 기념품 선택 모달 열기
  const handleOpenSouvenirModal = useCallback((index: number) => {
    const participant = participants[index];
    // 확인필요, 환불요청 상태인 경우 모달을 열 수 없음 (수정 모드 포함)
    // 결제완료(COMPLETED/PAID)는 종목/기념품 수정 가능
    if (isCategorySouvenirDisabled(participant.paymentStatus)) {
      return;
    }
    if (!participant.category || participant.category === '종목') {
      return;
    }
    
    const { distance, categoryName } = parseCategoryWithDistance(participant.category);
    openSouvenirModal(index, categoryName, distance);
  }, [participants, openSouvenirModal, isCategorySouvenirDisabled]);

  // 기념품 선택 확인
  const handleConfirmSouvenirSelection = useCallback((selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>) => {
    const { participantIndex } = souvenirModalState;
    
    if (participantIndex === -1) return;

    const participant = participants[participantIndex];
    const paymentStatus = participant.paymentStatus?.toUpperCase();
    
    // 확인필요, 환불요청 상태인 경우 변경 불가
    if (isCategorySouvenirDisabled(participant.paymentStatus)) {
      closeSouvenirModal();
      return;
    }

    // 결제완료 상태에서 동일 금액 체크
    // 기념품은 종목이 같으면 금액이 동일하므로, 종목이 변경되지 않았는지만 확인
    // (기념품 자체는 추가 금액이 없으므로 종목 금액만 확인)
    const isCompleted = paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
    if (isCompleted && participant.originalAmount !== undefined) {
      // 종목이 변경되지 않았는지 확인 (기념품 변경은 종목 금액에 영향 없음)
      const currentAmount = calculateParticipantFee(participant.category, eventInfo);
      if (currentAmount !== participant.originalAmount) {
        setErrorModalState({
          isOpen: true,
          message: `결제완료 상태에서는 동일 금액(${participant.originalAmount.toLocaleString()}원) 내에서만 기념품을 변경할 수 있습니다.`
        });
        closeSouvenirModal();
        return;
      }
    }

    const newParticipants = participants.map((p, i) => {
      if (i === participantIndex) {
        const updatedParticipant = {
          ...p,
          selectedSouvenirs: selectedSouvenirs
        };
        
        // 기존 호환성을 위해 첫 번째 기념품을 souvenir와 size에 저장
        const firstSouvenir = selectedSouvenirs[0];
        if (firstSouvenir) {
          updatedParticipant.souvenir = firstSouvenir.souvenirId;
          updatedParticipant.size = firstSouvenir.size;
        } else {
          updatedParticipant.souvenir = '';
          updatedParticipant.size = '';
        }
        
        return updatedParticipant;
      }
      return p;
    });
    
    onParticipantsChange(newParticipants);
    closeSouvenirModal();
  }, [souvenirModalState, participants, onParticipantsChange, closeSouvenirModal, isCategorySouvenirDisabled, eventInfo]);

  // 현재 선택된 카테고리의 거리와 이름 추출 (모달용)
  const getCurrentCategoryInfo = useCallback((participant: ParticipantData) => {
    if (!participant || !participant.category) {
      return { distance: '', categoryName: '' };
    }
    // category가 "거리|세부종목" 형식인지 확인
    const categoryStr = String(participant.category || '').trim();
    if (!categoryStr || !categoryStr.includes('|')) {
      return { distance: '', categoryName: categoryStr };
    }
    return parseCategoryWithDistance(categoryStr);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">참가자 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      {/* 참가인원 입력 섹션 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <span className="text-lg sm:text-xl font-bold text-black text-center">참가인원 입력 후 확인버튼을 클릭해 주세요!</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="명" 
              value={pendingParticipantCount}
              onChange={(e) => {
                if (isEditMode) return;
                const newCount = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                setPendingParticipantCount(newCount);
              }}
              min="0"
              max="100"
              disabled={isEditMode}
              className={`w-20 px-3 py-2 rounded-lg text-center border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isEditMode ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
              }`}
            />
            <span className="text-lg font-bold text-black">명</span>
            <button
              type="button"
              onClick={() => {
                if (isEditMode) return;
                let message = '';
                if (pendingParticipantCount === participants.length) {
                  message = `참가인원이 이미 ${participants.length}명으로 설정되어 있습니다.`;
                } else {
                  handleParticipantCountChange(pendingParticipantCount);
                  message = `참가인원이 ${pendingParticipantCount}명으로 설정되었습니다.`;
                }
                setConfirmModalState({ open: true, message });
              }}
              disabled={isEditMode}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isEditMode 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              확인
            </button>
          </div>

    {/* 참가인원 확인 모달 */}
          {confirmModalState.open && !isEditMode && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-[90%] p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-base font-medium text-gray-900 mb-6 whitespace-pre-line">{confirmModalState.message}</p>
          <button
            type="button"
            onClick={() => setConfirmModalState({ open: false, message: '' })}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    )}
        </div>
        </div>

        {/* 대표자 입력 안내 문구 */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-800 leading-relaxed">
            대표자도 대회에 참여하는 경우 아래 참가자 정보를 작성하시기 바랍니다.
          </p>
              <p className="text-xs text-gray-600 italic leading-relaxed">
            *(한번에 최대 100명까지만 신청 가능하며, 초과 인원은 별도의 단체로 신청 해주시기 바랍니다.)
          </p>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 인원 등록 섹션 - 수정 모드에서만 표시 */}
      {isEditMode && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-md ${
                    participants.length >= 100
                      ? 'bg-gray-200'
                      : 'bg-blue-100'
                  }`}>
                    <svg 
                      className={`w-4 h-4 ${
                        participants.length >= 100 
                          ? 'text-gray-500' 
                          : 'text-blue-600'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">추가 인원 등록</h3>
                </div>
                <p className="text-xs text-gray-600 ml-8">
                  새로운 참가자를 추가할 수 있습니다. 기존 참가자는 삭제할 수 없습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNewParticipant}
                disabled={participants.length >= 100}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 whitespace-nowrap ${
                  participants.length >= 100
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm active:scale-[0.98]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                참가자 추가
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 참가자 테이블 */}
      <div className="overflow-x-scroll overflow-y-visible border-l border-r border-gray-400 bg-white p-2 always-scrollbar" style={{ overflowY: 'visible' }}>
        <table className="w-full border-collapse min-w-[2132px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-3 text-sm font-bold text-center w-20 border-r border-gray-300">번호</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">이름</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">생년월일</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-48 border-r border-gray-300">연락처</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">성별</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">참가종목</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">기념품</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">총금액</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">결제상태</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-16">삭제</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => {
              const isExistingParticipant = isEditMode && Boolean(participant.registrationId);
              const isNewParticipant = isEditMode && !participant.registrationId;
              const paymentStatus = participant.paymentStatus?.toUpperCase();
              
              // 전체 행 블락 상태: 확인필요, 환불요청(전액/차액), 환불완료 상태
              // 이 상태에서는 모든 필드 수정 불가, 입력 클릭 차단, 행 전체 비활성화
              const isRowBlocked = (
                paymentStatus === 'MUST_CHECK' ||
                paymentStatus === 'NEED_REFUND' ||
                paymentStatus === 'NEED_PARTITIAL_REFUND' ||
                paymentStatus === 'REFUNDED'
              );
              
              // 미결제 상태: 모든 필드 수정 가능
              // paymentStatus가 없거나 undefined인 경우(새로 추가된 참가자)도 미결제로 간주
              const isUnpaid = !paymentStatus || paymentStatus === 'UNPAID';
              
              // 결제완료 상태: 번호, 이름, 생년월일, 연락처, 성별 수정 가능
              // 동일 금액 내에서만 종목/기념품 수정 가능
              const isCompleted = (
                paymentStatus === 'COMPLETED' ||
                paymentStatus === 'PAID'
              );
              
              // 참가자 기본 정보 수정 가능 여부: 미결제, 결제완료 상태에서만 수정 가능
              const canEditParticipantInfo = isUnpaid || isCompleted;
              
              // 종목/기념품 변경 가능 여부
              // - 미결제: 모두 수정 가능
              // - 결제완료: 동일 금액 내에서만 수정 가능 (추후 구현)
              // - 그 외: 수정 불가
              const canEditCategorySouvenir = isUnpaid || isCompleted;
              const isCategorySouvenirChangeDisabled = !canEditCategorySouvenir;
              
              // isDisabled는 행 블락 상태와 동일 (기존 코드 호환성)
              const isDisabled = isRowBlocked;
              
              return (
              <React.Fragment key={index}>
                {isEditMode && index === 0 && existingParticipantsCount > 0 && (
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <td colSpan={10} className="px-4 py-2 text-sm font-semibold text-gray-700">
                      기존 신청자 ({existingParticipantsCount}명)
                    </td>
                  </tr>
                )}
                {isEditMode && index === firstNewParticipantIndex && (
                  <tr className="bg-blue-50 border-y border-blue-200">
                    <td colSpan={10} className="px-4 py-2 text-sm font-semibold text-blue-700">
                      신규 추가 신청자 ({participants.length - existingParticipantsCount}명)
                    </td>
                  </tr>
                )}
              <tr
                className={`border-b border-gray-200 ${
                  isDisabled
                    ? 'bg-gray-50 opacity-75 cursor-not-allowed'
                    : ''
                }`}
                style={isDisabled ? { pointerEvents: 'none' } : {}}
              >
                <td className="px-3 py-3 text-center text-sm w-20 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1.5">
                    {isNewParticipant && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold leading-none">
                        신규
                      </span>
                    )}
                    {index + 1}.
                    {isDisabled && (
                      <span className="text-xs text-orange-600 font-semibold" title="수정불가">🔒</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 w-32 border-r border-gray-200">
                  <input
                    key={`name-${index}`}
                    type="text"
                    placeholder="성명"
                    value={participant.name}
                    disabled={isDisabled}
                    onChange={(e) => {
                      if (isDisabled) return;
                      handleParticipantChange(index, 'name', e.target.value);
                    }}
                    className={`w-full px-2 py-2 border-0 text-sm focus:ring-0 text-center ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD 형식"
                    value={`${participant.birthYear}${participant.birthYear ? '-' : ''}${participant.birthMonth}${participant.birthMonth ? '-' : ''}${participant.birthDay}`}
                    disabled={isDisabled}
                    onChange={(e) => {
                      if (isDisabled) return;
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      
                      if (value.length >= 4) {
                        value = value.slice(0, 4) + '-' + value.slice(4);
                      }
                      if (value.length >= 7) {
                        value = value.slice(0, 7) + '-' + value.slice(7, 9);
                      }
                      
                      const parts = value.split('-');
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            birthYear: parts[0] || '',
                            birthMonth: parts[1] || '',
                            birthDay: parts[2] || ''
                          };
                        }
                        return p;
                      });
                      
                      onParticipantsChange(newParticipants);
                    }}
                    onKeyDown={(e) => {
                      if (isDisabled) return;
                      if (e.key === 'Backspace') {
                        const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
                        const currentValue = `${participant.birthYear}${participant.birthYear ? '-' : ''}${participant.birthMonth}${participant.birthMonth ? '-' : ''}${participant.birthDay}`;
                        
                        if (cursorPosition === 5 || cursorPosition === 8) {
                          e.preventDefault();
                          const newValue = currentValue.slice(0, cursorPosition - 2) + currentValue.slice(cursorPosition);
                          const parts = newValue.split('-');
                          const newParticipants = participants.map((p, i) => {
                            if (i === index) {
                              return {
                                ...p,
                                birthYear: parts[0] || '',
                                birthMonth: parts[1] || '',
                                birthDay: parts[2] || ''
                              };
                            }
                            return p;
                          });
                          
                          onParticipantsChange(newParticipants);
                          
                          setTimeout(() => {
                            const input = e.target as HTMLInputElement;
                            input.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
                          }, 0);
                        }
                      }
                    }}
                    maxLength={10}
                    className={`w-full px-2 py-2 border-0 text-sm focus:ring-0 text-center ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </td>
                <td className="px-3 py-3 w-48 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm text-gray-600">010</span>
                    <span className="text-sm text-gray-400">-</span>
                    <input
                      key={`phone2-${index}`}
                      type="text"
                      value={participant.phone2}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (isDisabled) return;
                        handleParticipantChange(index, 'phone2', e.target.value.replace(/[^0-9]/g, ''));
                      }}
                      className={`w-16 px-1 py-2 border-0 text-sm focus:ring-0 text-center ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      maxLength={4}
                    />
                    <span className="text-sm text-gray-400">-</span>
                    <input
                      key={`phone3-${index}`}
                      type="text"
                      value={participant.phone3}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (isDisabled) return;
                        handleParticipantChange(index, 'phone3', e.target.value.replace(/[^0-9]/g, ''));
                      }}
                      className={`w-16 px-1 py-2 border-0 text-sm focus:ring-0 text-center ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      maxLength={4}
                    />
                  </div>
                </td>
                <td className="px-3 py-3 w-32 border-r border-gray-200">
                  <select
                    value={participant.gender}
                    disabled={isDisabled}
                    onChange={(e) => {
                      if (isDisabled) return;
                      handleParticipantChange(index, 'gender', e.target.value);
                    }}
                    className={`w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none text-center ${
                      isDisabled 
                        ? 'bg-gray-100 cursor-not-allowed opacity-75' 
                        : 'bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2rem'
                    }}
                  >
                    <option value="성별">성별</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (isCategorySouvenirChangeDisabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                      handleOpenCategoryModal(index);
                    }}
                    disabled={isCategorySouvenirChangeDisabled}
                    style={isCategorySouvenirChangeDisabled ? { pointerEvents: 'none', cursor: 'not-allowed' } : {}}
                    className={`w-full px-3 py-2 border-2 border-dashed border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 hover:bg-blue-100 transition-colors text-center font-medium ${
                      isCategorySouvenirChangeDisabled 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' 
                        : 'cursor-pointer hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{getCategoryDisplayText(participant, eventInfo)}</span>
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  {(() => {
                    const souvenirText = getSouvenirDisplayText(participant, eventInfo);
                    const isSouvenirSelected = souvenirText !== '기념품 선택' && souvenirText !== '참가종목을 먼저 선택해주세요';
                    // 종목/기념품 변경 불가 상태 또는 기념품 선택 불가 상태
                    const isDisabledField = isCategorySouvenirChangeDisabled || participantDisabledStates[index]?.isSouvenirDisabled || false;
                    
                    return (
                  <button
                    type="button"
                        onClick={(e) => {
                          if (isDisabledField) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }
                          handleOpenSouvenirModal(index);
                        }}
                        disabled={isDisabledField}
                        style={isDisabledField ? { pointerEvents: 'none', cursor: 'not-allowed' } : {}}
                        className={`w-full px-3 py-2 border-2 border-dashed rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center font-medium ${
                          isDisabledField
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
                            : isSouvenirSelected
                            ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400 cursor-pointer'
                            : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                          <span className={isSouvenirSelected ? 'text-blue-700' : 'text-gray-600'}>{souvenirText}</span>
                          <svg 
                            className={`w-3 h-3 ${isSouvenirSelected ? 'text-blue-500' : 'text-gray-400'}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                    );
                  })()}
                </td>
                <td className="px-3 py-3 text-center text-sm w-80 border-r border-gray-200">
                  {calculateParticipantFee(participant.category, eventInfo).toLocaleString()}원
                </td>
                <td className="px-3 py-3 text-center text-sm w-32 border-r border-gray-200">
                  <span className={`text-sm font-semibold ${getPaymentStatusColorClass(participant.paymentStatus)}`}>
                    {formatPaymentStatusText(participant.paymentStatus)}
                      </span>
                </td>
                <td className="px-3 py-3 text-center text-sm w-16">
                  {(() => {
                    // 수정 모드에서는 기존 참가자(registrationId가 있는 참가자)는 삭제 불가
                    const canDelete = !isDisabled && (!isEditMode || !isExistingParticipant);
                    
                    return (
                  <button
                    type="button"
                    onClick={() => {
                          if (isEditMode) {
                            handleDeleteNewParticipant(index);
                          } else {
                      handleDeleteParticipant(index);
                          }
                    }}
                        disabled={!canDelete}
                    className={`w-6 h-6 rounded-full transition-colors flex items-center justify-center text-sm font-bold mx-auto ${
                          !canDelete
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                        title={
                          isExistingParticipant 
                            ? '기존 참가자는 삭제할 수 없습니다' 
                            : isDisabled 
                            ? '결제완료된 참가자는 삭제할 수 없습니다' 
                            : '참가자 삭제'
                        }
                  >
                    -
                  </button>
                    );
                  })()}
                </td>
              </tr>
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 참가종목 선택 모달 */}
      <CategorySelectionModal
        isOpen={categoryModalState.isOpen}
        onClose={closeCategoryModal}
        onConfirm={handleConfirmCategorySelection}
        eventInfo={eventInfo}
        currentDistance={(() => {
          if (categoryModalState.participantIndex >= 0 && participants[categoryModalState.participantIndex]) {
            const participant = participants[categoryModalState.participantIndex];
            const info = getCurrentCategoryInfo(participant);
            // "TEST|테스트1 마라톤" -> distance: "TEST"
            return String(info.distance || '').trim();
          }
          return '';
        })()}
        currentCategory={(() => {
          if (categoryModalState.participantIndex >= 0 && participants[categoryModalState.participantIndex]) {
            const participant = participants[categoryModalState.participantIndex];
            const info = getCurrentCategoryInfo(participant);
            // "TEST|테스트1 마라톤" -> categoryName: "테스트1 마라톤"
            return String(info.categoryName || '').trim();
          }
          return '';
        })()}
      />

      {/* 기념품 선택 모달 */}
      <SouvenirSelectionModal
        isOpen={souvenirModalState.isOpen}
        onClose={closeSouvenirModal}
        onConfirm={handleConfirmSouvenirSelection}
        categoryName={souvenirModalState.categoryName}
        distance={souvenirModalState.distance}
        eventInfo={eventInfo}
        currentSelection={souvenirModalState.participantIndex >= 0 ? (
          participants[souvenirModalState.participantIndex]?.selectedSouvenirs && participants[souvenirModalState.participantIndex].selectedSouvenirs.length > 0 
            ? participants[souvenirModalState.participantIndex].selectedSouvenirs
            : (participants[souvenirModalState.participantIndex]?.souvenir && 
               participants[souvenirModalState.participantIndex].souvenir !== '선택' && 
               participants[souvenirModalState.participantIndex].souvenir !== '' ? [{
                souvenirId: participants[souvenirModalState.participantIndex].souvenir,
                souvenirName: (() => {
                  if (!eventInfo || !participants[souvenirModalState.participantIndex]?.category) return '';
                  const { distance, categoryName } = parseCategoryWithDistance(participants[souvenirModalState.participantIndex].category);
                  const selectedCategory = eventInfo.categorySouvenirList.find(c => {
                    if (distance) {
                      return c.categoryName === categoryName && c.distance === distance;
                    }
                    return c.categoryName === categoryName;
                  });
                  if (selectedCategory) {
                    const selectedSouvenirObj = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participants[souvenirModalState.participantIndex].souvenir);
                    return selectedSouvenirObj?.souvenirName || '';
                  }
                  return '';
                })(),
                size: participants[souvenirModalState.participantIndex].size || ''
              }] : [])
        ) : []}
      />

      {/* 동일 금액 체크 에러 모달 */}
      <ErrorModal
        isOpen={errorModalState.isOpen}
        onClose={() => setErrorModalState({ isOpen: false, message: '' })}
        title="알림"
        message={errorModalState.message}
        confirmText="확인"
      />
    </div>
  );
});

export default ParticipantsSection;