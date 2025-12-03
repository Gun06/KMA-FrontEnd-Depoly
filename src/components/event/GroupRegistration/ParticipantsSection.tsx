"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { getParticipationFee } from "@/app/event/[eventId]/registration/apply/shared/utils/calculations";
import { convertPaymentStatusToKorean } from "@/types/registration";
import SouvenirSelectionModal from './SouvenirSelectionModal';

interface ParticipantsSectionProps {
  participants: ParticipantData[];
  eventInfo: EventRegistrationInfo | null;
  onParticipantsChange: (participants: ParticipantData[]) => void;
}

const ParticipantsSection = memo(function ParticipantsSection({ participants, eventInfo, onParticipantsChange }: ParticipantsSectionProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    participantIndex: number;
    categoryName: string;
  }>({
    isOpen: false,
    participantIndex: -1,
    categoryName: ''
  });

  const [pendingParticipantCount, setPendingParticipantCount] = useState(() => participants.length);
  const [confirmModalState, setConfirmModalState] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    setPendingParticipantCount(participants.length);
  }, [participants.length]);

  const handleParticipantChange = useCallback((index: number, field: keyof ParticipantData, value: string) => {
    const newParticipants = participants.map((participant, i) => {
      if (i === index) {
        // 참가종목이 변경되면 기념품 관련 필드들 초기화
        if (field === 'category') {
          return {
            ...participant,
            [field]: value,
            souvenir: '선택',
            size: '사이즈',
            selectedSouvenirs: []
          };
        }
        
        return { ...participant, [field]: value };
      }
      return participant;
    });
    
    onParticipantsChange(newParticipants);
  }, [participants, onParticipantsChange]);

  const handleParticipantCountChange = useCallback((newCount: number) => {
    const currentCount = participants.length;
    
    if (newCount > currentCount) {
      // 참가자 추가
      const newParticipants = [...participants];
      for (let i = currentCount; i < newCount; i++) {
        newParticipants.push({
          name: '',
          birthYear: '',
          birthMonth: '',
          birthDay: '',
          phone1: '010',
          phone2: '',
          phone3: '',
          gender: '성별',
          category: '종목',
          souvenir: '선택',
          size: '',
          selectedSouvenirs: [],
          // email1: '', // API 구조 변경으로 제거
          // email2: '', // API 구조 변경으로 제거
          // emailDomain: '직접입력' // API 구조 변경으로 제거
          note: ''
        });
      }
      onParticipantsChange(newParticipants);
    } else if (newCount < currentCount) {
      // 참가자 제거
      const newParticipants = participants.slice(0, newCount);
      onParticipantsChange(newParticipants);
    }
  }, [participants, onParticipantsChange]);

  // 기념품 선택 모달 열기
  const handleOpenSouvenirModal = useCallback((index: number) => {
    const participant = participants[index];
    // 결제완료된 참가자는 모달을 열 수 없음
    if (participant.paymentStatus === 'PAID') {
      return;
    }
    if (!participant.category || participant.category === '종목') {
      return;
    }
    
    setModalState({
      isOpen: true,
      participantIndex: index,
      categoryName: participant.category
    });
  }, [participants]);

  // 기념품 선택 모달 닫기
  const handleCloseSouvenirModal = useCallback(() => {
    setModalState({
      isOpen: false,
      participantIndex: -1,
      categoryName: ''
    });
  }, []);

  // 기념품 선택 확인
  const handleConfirmSouvenirSelection = useCallback((selectedSouvenirs: Array<{souvenirId: string, souvenirName: string, size: string}>) => {
    const { participantIndex } = modalState;
    
    if (participantIndex === -1) return;

    const newParticipants = participants.map((p, i) => {
      if (i === participantIndex) {
        // 여러 기념품을 selectedSouvenirs에 저장
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
    handleCloseSouvenirModal();
  }, [modalState, participants, onParticipantsChange, handleCloseSouvenirModal]);

  const handleDeleteParticipant = useCallback((index: number) => {
    // 결제완료된 참가자는 삭제할 수 없음
    const participant = participants[index];
    if (participant.paymentStatus === 'PAID') {
      return;
    }
    const newParticipants = participants.filter((_, i) => i !== index);
    onParticipantsChange(newParticipants);
  }, [participants, onParticipantsChange]);

  // 참가자별 기념품 옵션을 메모이제이션
  const participantSouvenirOptions = useMemo(() => {
    return participants.map((participant, index) => {
      if (!participant.category || !eventInfo) return null;
      
      const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participant.category);
      return selectedCategory?.categorySouvenirPair.map(souvenir => (
        <option key={souvenir.souvenirId} value={souvenir.souvenirId}>
          {souvenir.souvenirName}
        </option>
      )) || null;
    });
  }, [participants, eventInfo]);

  // 참가자별 사이즈 옵션을 메모이제이션
  const participantSizeOptions = useMemo(() => {
    return participants.map((participant, index) => {
      if (!participant.souvenir || !eventInfo || !participant.category) return null;
      
      const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participant.category);
      if (!selectedCategory) return null;
      
      const selectedSouvenir = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participant.souvenir);
      if (!selectedSouvenir || !selectedSouvenir.souvenirSize) return null;
      
      // 기념품 없음 처리
      const isNoSouvenir = selectedSouvenir.souvenirName === '기념품 없음' || 
                          selectedSouvenir.souvenirId === '0' || 
                          selectedSouvenir.souvenirId === '1' || 
                          selectedSouvenir.souvenirId === '2';
      
      if (isNoSouvenir) return null;
      
      return selectedSouvenir.souvenirSize.map(size => (
        <option key={size} value={size}>
          {size}
        </option>
      ));
    });
  }, [participants, eventInfo]);

  // 참가자별 disabled 상태를 메모이제이션
  const participantDisabledStates = useMemo(() => {
    return participants.map((participant, index) => {
      const isSouvenirDisabled = !participant.category || participant.category === '' || participant.category === '종목';
      
      const isSizeDisabled = (() => {
        if (!participant.souvenir || participant.souvenir === '' || participant.souvenir === '선택') return true;
        
        // 기념품 없음 판단 (ID 기반)
        if (participant.souvenir === '0' || participant.souvenir === '1' || participant.souvenir === '2') return true;
        
        // 기념품 없음 판단 (이름 기반) - 이벤트 정보에서 확인
        if (eventInfo && participant.category) {
          const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participant.category);
          if (selectedCategory) {
            const selectedSouvenir = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participant.souvenir);
            if (selectedSouvenir && selectedSouvenir.souvenirName === '기념품 없음') return true;
          }
        }
        
        return false;
      })();

      return {
        isSouvenirDisabled,
        isSizeDisabled
      };
    });
  }, [participants, eventInfo]);

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
                const newCount = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                setPendingParticipantCount(newCount);
              }}
              min="0"
              max="100"
              className="w-20 px-3 py-2 rounded-lg text-center border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-lg font-bold text-black">명</span>
            <button
              type="button"
              onClick={() => {
                let message = '';
                if (pendingParticipantCount === participants.length) {
                  message = `참가인원이 이미 ${participants.length}명으로 설정되어 있습니다.`;
                } else {
                  handleParticipantCountChange(pendingParticipantCount);
                  message = `참가인원이 ${pendingParticipantCount}명으로 설정되었습니다.`;
                }
                setConfirmModalState({ open: true, message });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              확인
            </button>
          </div>

    {/* 참가인원 확인 모달 */}
    {confirmModalState.open && (
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

        {/* 대표자 입력 안내 문구 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center text-sm text-gray-700 space-y-1">
          <p>
            대표자도 대회에 참여하는 경우 아래 참가자 정보를 작성하시기 바랍니다.
          </p>
          <p className="text-xs text-blue-600 italic">
            *(한번에 최대 100명까지만 신청 가능하며, 초과 인원은 별도의 단체로 신청 해주시기 바랍니다.)
          </p>
        </div>
      </div>
      
      {/* 참가자 테이블 */}
      <div className="overflow-x-scroll overflow-y-visible border-l border-r border-gray-400 bg-white p-2 always-scrollbar">
        <table className="w-full border-collapse min-w-[2100px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-3 text-sm font-bold text-center w-20 border-r border-gray-300">번호</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">이름</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">생년월일</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-48 border-r border-gray-300">연락처</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">성별</th>
              {/* <th className="px-3 py-3 text-sm font-bold text-center w-56 border-r border-gray-300">이메일</th> */}
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">참가종목</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">기념품</th>
              {/* <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">사이즈</th> */}
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">총금액</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">결제상태</th>
              {/* <th className="px-3 py-3 text-sm font-bold text-center w-80 border-r border-gray-300">비고</th> */}
              <th className="px-3 py-3 text-sm font-bold text-center w-16">삭제</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => {
              // UNPAID가 아닌 모든 결제상태는 편집 불가능
              const isDisabled = participant.paymentStatus && participant.paymentStatus !== 'UNPAID';
              
              return (
              <tr 
                key={index} 
                className={`border-b border-gray-200 ${isDisabled ? 'bg-gray-50 opacity-75 cursor-not-allowed' : ''}`}
                style={isDisabled ? { pointerEvents: 'none' } : {}}
              >
                <td className="px-3 py-3 text-center text-sm w-20 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1">
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
                      const nameValue = e.target.value;
                      
                      // 한 번에 모든 변경사항을 적용
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            name: nameValue
                          };
                        }
                        return p;
                      });
                      
                      onParticipantsChange(newParticipants);
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
                      let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
                      
                      // YYYY-MM-DD 형식으로 자동 포맷팅
                      if (value.length >= 4) {
                        value = value.slice(0, 4) + '-' + value.slice(4);
                      }
                      if (value.length >= 7) {
                        value = value.slice(0, 7) + '-' + value.slice(7, 9);
                      }
                      
                      // 한 번에 모든 변경사항을 적용
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          const parts = value.split('-');
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
                      // 백스페이스 키로 삭제할 때 - 앞의 숫자도 함께 삭제되도록 처리
                      if (e.key === 'Backspace') {
                        const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
                        const currentValue = `${participant.birthYear}${participant.birthYear ? '-' : ''}${participant.birthMonth}${participant.birthMonth ? '-' : ''}${participant.birthDay}`;
                        
                        // 커서가 - 바로 뒤에 있을 때 - 앞의 숫자도 함께 삭제
                        if (cursorPosition === 5 || cursorPosition === 8) { // YYYY-|MM-DD 또는 YYYY-MM-|DD
                          e.preventDefault();
                          const newValue = currentValue.slice(0, cursorPosition - 2) + currentValue.slice(cursorPosition);
                          
                          const newParticipants = participants.map((p, i) => {
                            if (i === index) {
                              const parts = newValue.split('-');
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
                          
                          // 커서 위치 조정
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
                        const phone2Value = e.target.value.replace(/[^0-9]/g, '');
                        
                        // 한 번에 모든 변경사항을 적용
                        const newParticipants = participants.map((p, i) => {
                          if (i === index) {
                            return {
                              ...p,
                              phone2: phone2Value
                            };
                          }
                          return p;
                        });
                        
                        onParticipantsChange(newParticipants);
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
                        const phone3Value = e.target.value.replace(/[^0-9]/g, '');
                        
                        // 한 번에 모든 변경사항을 적용
                        const newParticipants = participants.map((p, i) => {
                          if (i === index) {
                            return {
                              ...p,
                              phone3: phone3Value
                            };
                          }
                          return p;
                        });
                        
                        onParticipantsChange(newParticipants);
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
                      const selectedGender = e.target.value;
                      
                      // 한 번에 모든 변경사항을 적용
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            gender: selectedGender
                          };
                        }
                        return p;
                      });
                      
                      onParticipantsChange(newParticipants);
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
                {/* 이메일 컬럼 - API 구조 변경으로 주석 처리 */}
                {/* <td className="px-3 py-3 w-56 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      placeholder="이메일"
                      value={participant.email1 || ''}
                      onChange={(e) => {
                        const email1Value = e.target.value;
                        
                        // 한 번에 모든 변경사항을 적용
                        const newParticipants = participants.map((p, i) => {
                          if (i === index) {
                            return {
                              ...p,
                              email1: email1Value
                            };
                          }
                          return p;
                        });
                        
                        onParticipantsChange(newParticipants);
                      }}
                      className="w-32 px-1 py-2 border-0 text-sm focus:ring-0 text-center"
                    />
                    <span className="text-sm text-gray-400">@</span>
                    <input
                      type="text"
                      placeholder="직접입력"
                      value={participant.email2 || ''}
                      onChange={(e) => {
                        const email2Value = e.target.value;
                        
                        // 한 번에 모든 변경사항을 적용
                        const newParticipants = participants.map((p, i) => {
                          if (i === index) {
                            return {
                              ...p,
                              email2: email2Value,
                              emailDomain: email2Value ? email2Value : 'naver.com'
                            };
                          }
                          return p;
                        });
                        
                        onParticipantsChange(newParticipants);
                      }}
                      className="w-28 px-1 py-2 border-0 text-sm focus:ring-0 text-center"
                    />
                    <select
                      value={participant.emailDomain || '직접입력'}
                      onChange={(e) => {
                        const selectedDomain = e.target.value;
                        
                        // 한 번에 모든 변경사항을 적용
                        const newParticipants = participants.map((p, i) => {
                          if (i === index) {
                            return {
                              ...p,
                              emailDomain: selectedDomain,
                              email2: selectedDomain !== '직접입력' ? selectedDomain : p.email2
                            };
                          }
                          return p;
                        });
                        
                        onParticipantsChange(newParticipants);
                      }}
                      className="w-32 px-1 py-2 border-0 text-sm focus:ring-0 text-center bg-transparent appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.1rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1em 1em',
                        paddingRight: '1.2rem'
                      }}
                    >
                      <option value="직접입력">직접입력</option>
                      <option value="naver.com">naver.com</option>
                      <option value="gmail.com">gmail.com</option>
                      <option value="daum.net">daum.net</option>
                      <option value="hanmail.net">hanmail.net</option>
                      <option value="hotmail.com">hotmail.com</option>
                      <option value="outlook.com">outlook.com</option>
                      <option value="icloud.com">icloud.com</option>
                    </select>
                  </div>
                </td> */}
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <select
                    value={participant.category || ''}
                    disabled={isDisabled}
                    onChange={(e) => {
                      if (isDisabled) return;
                      const selectedCategory = e.target.value;
                      handleParticipantChange(index, 'category', selectedCategory);
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
                    <option value="종목">종목</option>
                    {eventInfo?.categorySouvenirList.map(category => (
                      <option key={category.categoryId} value={category.categoryName}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  {/* 기념품 선택 버튼 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;
                      handleOpenSouvenirModal(index);
                    }}
                    disabled={isDisabled || participantDisabledStates[index]?.isSouvenirDisabled || false}
                    className={`w-full px-3 py-2 border-2 border-dashed border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 hover:bg-blue-100 transition-colors text-center font-medium ${
                      (isDisabled || participantDisabledStates[index]?.isSouvenirDisabled) ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' : 'cursor-pointer hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {(() => {
                          if (!eventInfo || !participant.category || participant.category === '종목') {
                            return '참가종목을 먼저 선택해주세요';
                          }
                          
                          // 여러 기념품이 선택된 경우
                          if (participant.selectedSouvenirs && participant.selectedSouvenirs.length > 0) {
                            if (participant.selectedSouvenirs.length === 1) {
                              // 하나만 선택된 경우: "기념품명 (사이즈)"
                              const souvenir = participant.selectedSouvenirs[0];
                              return `${souvenir.souvenirName}${souvenir.size ? ` (${souvenir.size})` : ''}`;
                            } else {
                              // 여러 개 선택된 경우: "X개 기념품 선택됨"
                              return `${participant.selectedSouvenirs.length}개 기념품 선택됨`;
                            }
                          }
                          
                          // 기존 방식 (호환성)
                          if (participant.souvenir && participant.souvenir !== '') {
                            const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participant.category);
                            if (selectedCategory) {
                              const selectedSouvenirObj = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participant.souvenir);
                              if (selectedSouvenirObj) {
                                return selectedSouvenirObj.souvenirName;
                              }
                            }
                          }
                          
                          return '기념품 선택';
                        })()}
                      </span>
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                </td>
                {/* 사이즈는 기념품 선택 모달에서 처리 */}
                <td className="px-3 py-3 text-center text-sm w-80 border-r border-gray-200">
                  {(() => {
                    if (!participant.category || !eventInfo) return '0원';
                    
                    const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participant.category);
                    if (!selectedCategory) return '0원';
                    
                    // 기본 참가비
                    const totalFee = selectedCategory.amount || 0;
                    
                    // 기념품이 선택된 경우 추가 비용 (현재는 기념품 비용이 포함되어 있다고 가정)
                    return totalFee.toLocaleString() + '원';
                  })()}
                </td>
                {/* 결제상태 */}
                <td className="px-3 py-3 text-center text-sm w-32 border-r border-gray-200">
                  {(() => {
                    const status = participant.paymentStatus || 'UNPAID';
                    // 결제 상태 한글 변환
                    let statusText = '미입금';
                    if (status === 'PAID' || status === 'COMPLETED') {
                      statusText = '결제완료';
                    } else if (status === 'UNPAID') {
                      statusText = '미입금';
                    } else {
                      const koreanStatus = convertPaymentStatusToKorean(status);
                      statusText = koreanStatus === '미결제' ? '미입금' : koreanStatus;
                    }
                    
                    // 색상 결정
                    const statusUpper = status.toUpperCase();
                    let colorClass = 'text-red-600';
                    if (statusUpper === 'PAID' || statusUpper === 'COMPLETED') {
                      colorClass = 'text-green-600';
                    } else if (statusUpper === 'MUST_CHECK' || statusUpper === 'NEED_REFUND' || statusUpper === 'NEED_PARTITIAL_REFUND') {
                      colorClass = 'text-orange-600';
                    } else if (statusUpper === 'REFUNDED') {
                      colorClass = 'text-gray-600';
                    }
                    
                    return (
                      <span className={`text-sm font-semibold ${colorClass}`}>
                        {statusText}
                      </span>
                    );
                  })()}
                </td>
                {/* 비고 입력 (선택) - 주석 처리 */}
                {/* <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <input
                    type="text"
                    placeholder="비고(선택)"
                    value={participant.note || ''}
                    maxLength={50}
                    onChange={(e) => {
                      const noteValue = e.target.value;
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            note: noteValue
                          };
                        }
                        return p;
                      });
                      onParticipantsChange(newParticipants);
                    }}
                    className="w-full px-2 py-2 border-0 text-sm focus:ring-0"
                  />
                </td> */}
                <td className="px-3 py-3 text-center text-sm w-16">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;
                      handleDeleteParticipant(index);
                    }}
                    disabled={isDisabled}
                    className={`w-6 h-6 rounded-full transition-colors flex items-center justify-center text-sm font-bold mx-auto ${
                      isDisabled 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                    title={isDisabled ? '결제완료된 참가자는 삭제할 수 없습니다' : '참가자 삭제'}
                  >
                    -
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 기념품 선택 모달 */}
      <SouvenirSelectionModal
        isOpen={modalState.isOpen}
        onClose={handleCloseSouvenirModal}
        onConfirm={handleConfirmSouvenirSelection}
        categoryName={modalState.categoryName}
        eventInfo={eventInfo}
        currentSelection={modalState.participantIndex >= 0 ? (
          participants[modalState.participantIndex]?.selectedSouvenirs && participants[modalState.participantIndex].selectedSouvenirs.length > 0 
            ? participants[modalState.participantIndex].selectedSouvenirs
            : (participants[modalState.participantIndex]?.souvenir && 
               participants[modalState.participantIndex].souvenir !== '선택' && 
               participants[modalState.participantIndex].souvenir !== '' ? [{
                souvenirId: participants[modalState.participantIndex].souvenir,
                souvenirName: (() => {
                  if (!eventInfo || !participants[modalState.participantIndex]?.category) return '';
                  const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participants[modalState.participantIndex].category);
                  if (selectedCategory) {
                    const selectedSouvenirObj = selectedCategory.categorySouvenirPair.find(s => s.souvenirId === participants[modalState.participantIndex].souvenir);
                    return selectedSouvenirObj?.souvenirName || '';
                  }
                  return '';
                })(),
                size: participants[modalState.participantIndex].size || ''
              }] : [])
        ) : []}
      />
    </div>
  );
});

export default ParticipantsSection;
