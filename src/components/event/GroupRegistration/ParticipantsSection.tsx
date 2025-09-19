"use client";

import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { getParticipationFee } from "@/app/event/[eventId]/registration/apply/shared/utils/calculations";

interface ParticipantsSectionProps {
  participants: ParticipantData[];
  eventInfo: EventRegistrationInfo | null;
  onParticipantsChange: (participants: ParticipantData[]) => void;
}

export default function ParticipantsSection({ participants, eventInfo, onParticipantsChange }: ParticipantsSectionProps) {
  const handleParticipantChange = (index: number, field: keyof ParticipantData, value: string) => {
    console.log('참가자 정보 변경 시작:', { index, field, value });
    console.log('현재 participants:', participants);
    
    const newParticipants = participants.map((participant, i) => {
      if (i === index) {
        return { ...participant, [field]: value };
      }
      return participant;
    });
    
    console.log('참가자 정보 변경 완료:', {
      index,
      field,
      newValue: value,
      updatedParticipant: newParticipants[index]
    });
    
    onParticipantsChange(newParticipants);
  };

  const handleParticipantCountChange = (newCount: number) => {
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
          email1: '',
          email2: '',
          emailDomain: '직접입력'
        });
      }
      onParticipantsChange(newParticipants);
    } else if (newCount < currentCount) {
      // 참가자 제거
      const newParticipants = participants.slice(0, newCount);
      onParticipantsChange(newParticipants);
    }
  };

  const handleDeleteParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    onParticipantsChange(newParticipants);
  };

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
              value={participants.length}
              onChange={(e) => {
                const newCount = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                handleParticipantCountChange(newCount);
              }}
              min="0"
              max="100"
              className="w-20 px-3 py-2 rounded-lg text-center border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-lg font-bold text-black">명</span>
            <button
              type="button"
              onClick={() => {
                // 참가인원 확인 로직
                alert(`참가인원이 ${participants.length}명으로 설정되었습니다.`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </div>
      
      {/* 참가자 테이블 */}
      <div className="overflow-x-auto overflow-y-visible border-l border-r border-gray-400 bg-white p-2">
        <table className="w-full border-collapse min-w-[2000px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-3 text-sm font-bold text-center w-20 border-r border-gray-300">번호</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">이름</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">생년월일</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-48 border-r border-gray-300">연락처</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-32 border-r border-gray-300">성별</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-56 border-r border-gray-300">이메일</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">참가종목</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">기념품</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">사이즈</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-72 border-r border-gray-300">총금액</th>
              <th className="px-3 py-3 text-sm font-bold text-center w-16">삭제</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-3 py-3 text-center text-sm w-20 border-r border-gray-200">
                  {index + 1}.
                </td>
                <td className="px-3 py-3 w-32 border-r border-gray-200">
                  <input
                    key={`name-${index}`}
                    type="text"
                    placeholder="성명"
                    value={participant.name}
                    onChange={(e) => {
                      const nameValue = e.target.value;
                      console.log('이름 입력:', nameValue);
                      
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
                    className="w-full px-2 py-2 border-0 text-sm focus:ring-0 text-center"
                  />
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD 형식으로 입력해주세요"
                    value={`${participant.birthYear}${participant.birthYear ? '-' : ''}${participant.birthMonth}${participant.birthMonth ? '-' : ''}${participant.birthDay}`}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
                      console.log('생년월일 입력:', value);
                      
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
                    className="w-full px-2 py-2 border-0 text-sm focus:ring-0 text-center"
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
                      onChange={(e) => {
                        const phone2Value = e.target.value;
                        console.log('연락처 중간자리 입력:', phone2Value);
                        
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
                      className="w-16 px-1 py-2 border-0 text-sm focus:ring-0 text-center"
                      maxLength={4}
                    />
                    <span className="text-sm text-gray-400">-</span>
                    <input
                      key={`phone3-${index}`}
                      type="text"
                      value={participant.phone3}
                      onChange={(e) => {
                        const phone3Value = e.target.value;
                        console.log('연락처 마지막자리 입력:', phone3Value);
                        
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
                      className="w-16 px-1 py-2 border-0 text-sm focus:ring-0 text-center"
                      maxLength={4}
                    />
                  </div>
                </td>
                <td className="px-3 py-3 w-32 border-r border-gray-200">
                  <select
                    value={participant.gender}
                    onChange={(e) => {
                      const selectedGender = e.target.value;
                      console.log('성별 선택:', selectedGender);
                      
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
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors appearance-none cursor-pointer text-center"
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
                <td className="px-3 py-3 w-56 border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      placeholder="이메일"
                      value={participant.email1 || ''}
                      onChange={(e) => {
                        const email1Value = e.target.value;
                        console.log('이메일 아이디 입력:', email1Value);
                        
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
                        console.log('이메일 도메인 직접입력:', email2Value);
                        
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
                        console.log('이메일 도메인 선택:', selectedDomain);
                        
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
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <select
                    value={participant.category || ''}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      console.log('참가종목 선택:', selectedCategory);
                      
                      // 한 번에 모든 변경사항을 적용
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            category: selectedCategory,
                            souvenir: '', // 카테고리 변경 시 기념품 초기화
                            size: '' // 카테고리 변경 시 사이즈 초기화
                          };
                        }
                        return p;
                      });
                      
                      onParticipantsChange(newParticipants);
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors appearance-none cursor-pointer text-center"
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
                  <select
                    value={participant.souvenir || ''}
                    onChange={(e) => {
                      const selectedSouvenir = e.target.value;
                      console.log('기념품 선택:', selectedSouvenir);
                      
                      // 한 번에 모든 변경사항을 적용
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            souvenir: selectedSouvenir,
                            size: ''
                          };
                        }
                        return p;
                      });
                      
                      onParticipantsChange(newParticipants);
                    }}
                    disabled={!participant.category || participant.category === '' || participant.category === '종목'}
                    className={`w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors appearance-none cursor-pointer text-center ${
                      !participant.category || participant.category === '' || participant.category === '종목' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2rem'
                    }}
                  >
                    <option value="선택">기념품</option>
                    {participant.category && eventInfo && 
                      eventInfo.categorySouvenirList
                        .find(c => c.categoryName === participant.category)
                        ?.categorySouvenirPair.map(souvenir => (
                          <option key={souvenir.souvenirId} value={souvenir.souvenirId}>
                            {souvenir.souvenirName}
                          </option>
                        ))
                    }
                  </select>
                </td>
                <td className="px-3 py-3 w-80 border-r border-gray-200">
                  <select
                    value={participant.size || ''}
                    onChange={(e) => {
                      const selectedSize = e.target.value;
                      console.log('사이즈 선택:', selectedSize);
                      
                      // 한 번에 모든 변경사항을 적용
                      const newParticipants = participants.map((p, i) => {
                        if (i === index) {
                          return {
                            ...p,
                            size: selectedSize
                          };
                        }
                        return p;
                      });
                      
                      onParticipantsChange(newParticipants);
                    }}
                    disabled={!participant.souvenir || participant.souvenir === '' || participant.souvenir === 'none' || participant.souvenir === '선택' || participant.souvenir === '0'}
                    className={`w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors appearance-none cursor-pointer text-center ${
                      !participant.souvenir || participant.souvenir === '' || participant.souvenir === 'none' || participant.souvenir === '선택' || participant.souvenir === '0' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2rem'
                    }}
                  >
                    <option value="사이즈">사이즈</option>
                    {participant.souvenir && participant.souvenir !== 'none' && participant.souvenir !== '' && participant.souvenir !== '선택' && participant.souvenir !== '0' && eventInfo && 
                      eventInfo.categorySouvenirList
                        .find(c => c.categoryName === participant.category)
                        ?.categorySouvenirPair
                        .find(s => s.souvenirId === participant.souvenir)
                        ?.souvenirSize.map(size => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))
                    }
                  </select>
                </td>
                <td className="px-3 py-3 text-center text-sm w-80 border-r border-gray-200">
                  {(() => {
                    if (!participant.category || !eventInfo) return '0원';
                    
                    const selectedCategory = eventInfo.categorySouvenirList.find(c => c.categoryName === participant.category);
                    if (!selectedCategory) return '0원';
                    
                    // 기본 참가비
                    let totalFee = selectedCategory.amount || 0;
                    
                    // 기념품이 선택된 경우 추가 비용 (현재는 기념품 비용이 포함되어 있다고 가정)
                    return totalFee.toLocaleString() + '원';
                  })()}
                </td>
                <td className="px-3 py-3 text-center text-sm w-16">
                  <button
                    type="button"
                    onClick={() => handleDeleteParticipant(index)}
                    className="w-6 h-6 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center justify-center text-sm font-bold mx-auto"
                    title="참가자 삭제"
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
