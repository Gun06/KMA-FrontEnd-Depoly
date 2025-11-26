// 데이터 변환 함수들
import { IndividualFormData } from "../types/individual";
import { ApiSubmitData } from "../types/common";
import { GroupFormData, GroupApiRequestData } from "../types/group";
import { EventRegistrationInfo } from "../types/common";
import { formatBirthDate, formatPhoneNumber, formatEmail } from "./formatters";

// 개인신청 데이터 변환
export const transformFormDataToApi = (
  formData: IndividualFormData,
  eventInfo: EventRegistrationInfo | null
): ApiSubmitData => {
  if (!eventInfo) {
    throw new Error('이벤트 정보가 없습니다.');
  }

  const selectedCategory = eventInfo.categorySouvenirList.find(
    c => c.categoryName === formData.category
  );

  if (!selectedCategory) {
    throw new Error('선택된 카테고리를 찾을 수 없습니다.');
  }

  // 여러 기념품 처리
  if (!formData.selectedSouvenirs || formData.selectedSouvenirs.length === 0) {
    throw new Error('선택된 기념품이 없습니다.');
  }

  // 각 기념품에 대해 서버 데이터 검증
  const validatedSouvenirs = formData.selectedSouvenirs.map(selectedSouvenir => {
    const serverSouvenir = selectedCategory.categorySouvenirPair.find(
      s => s.souvenirId === selectedSouvenir.souvenirId
    );

    if (!serverSouvenir) {
      throw new Error(`기념품을 찾을 수 없습니다: ${selectedSouvenir.souvenirName}`);
    }

    // 서버에서 받은 정확한 사이즈 값 찾기
    const exactSize = serverSouvenir.souvenirSize.find(size => 
      size.trim() === selectedSouvenir.size.trim()
    );

    if (!exactSize) {
      throw new Error(`사이즈를 찾을 수 없습니다: ${selectedSouvenir.size}`);
    }

    return {
      souvenirId: selectedSouvenir.souvenirId,
      souvenirName: selectedSouvenir.souvenirName,
      size: exactSize
    };
  });

  const registrationInfo: any = {
    eventCategoryId: selectedCategory.categoryId,
    souvenir: validatedSouvenirs.map(souvenir => ({
      souvenirId: souvenir.souvenirId,
      selectedSize: souvenir.size
    }))
  };
  
  // note가 있을 때만 추가
  if (formData.note && formData.note.trim().length > 0) {
    registrationInfo.note = formData.note;
  }
  
  const apiData = {
    registrationPersonalInfo: {
      registerMustInfo: {
        personalInfo: {
          birth: formatBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay),
          name: formData.name,
          phNum: formatPhoneNumber(formData.phone1, formData.phone2, formData.phone3),
          email: formatEmail(formData.email1, formData.emailDomain),
          gender: formData.gender === 'male' ? 'M' : 'F'
        },
        registrationInfo
      },
      address: {
        address: formData.address,
        zipCode: formData.postalCode,
        addressDetail: formData.detailedAddress
      },
      paymentDefaultInfo: {
        paymentType: formData.paymentMethod === 'bank_transfer' ? 'ACCOUNT_TRANSFER' : 'CARD',
        paymenterName: formData.depositorName
      }
    },
    registrationPw: formData.password
  };

  return apiData;
};

// 개인신청 수정용 데이터 변환 (개인 신청 확인 결과 스키마에 맞춤)
export const transformFormDataToUpdateApi = (
  formData: IndividualFormData,
  eventInfo: EventRegistrationInfo | null
): any => {
  if (!eventInfo) {
    throw new Error('이벤트 정보가 없습니다.');
  }

  const selectedCategory = eventInfo.categorySouvenirList.find(
    c => c.categoryName === formData.category
  );

  if (!selectedCategory) {
    throw new Error('선택된 카테고리를 찾을 수 없습니다.');
  }

  // RegistrationPersonalCreateRequest 구조에 맞춰 데이터 변환
  const registrationInfo: any = {
    eventCategoryId: selectedCategory.categoryId,
    souvenir: (() => {
      // 여러 기념품 처리 (selectedSouvenirs 우선, 없으면 기존 souvenir 사용)
      const souvenirsToProcess = formData.selectedSouvenirs && formData.selectedSouvenirs.length > 0 
        ? formData.selectedSouvenirs 
        : [{ souvenirId: formData.souvenir, size: formData.size }];
      
      return souvenirsToProcess.map(selectedSouvenir => {
        const serverSouvenir = selectedCategory.categorySouvenirPair.find(
          s => s.souvenirId === selectedSouvenir.souvenirId
        );
        
        if (!serverSouvenir) {
          throw new Error(`기념품을 찾을 수 없습니다: ${selectedSouvenir.souvenirId}`);
        }
        
        const selectedSize = serverSouvenir.souvenirSize.find(size => size === selectedSouvenir.size);
        const exactSize = selectedSize || serverSouvenir.souvenirSize[0] || '';
        
        return {
          souvenirId: serverSouvenir.souvenirId,
          selectedSize: exactSize.trim()
        }
      });
    })()
  };
  
  // note가 있을 때만 추가
  if (formData.note && formData.note.trim().length > 0) {
    registrationInfo.note = formData.note;
  }
  
  const apiData = {
    registrationPersonalInfo: {
      registerMustInfo: {
        personalInfo: {
          birth: formatBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay),
          name: formData.name,
          phNum: formatPhoneNumber(formData.phone1, formData.phone2, formData.phone3),
          email: formatEmail(formData.email1, formData.emailDomain, formData.email2),
          gender: formData.gender === 'male' ? 'M' : 'F'
        },
        registrationInfo
      },
      address: {
        address: formData.address,
        zipCode: formData.postalCode,
        addressDetail: formData.detailedAddress
      },
      paymentDefaultInfo: {
        paymentType: formData.paymentMethod === 'bank_transfer' ? 'ACCOUNT_TRANSFER' : 'CARD',
        paymenterName: formData.depositorName
      }
    },
    registrationPw: formData.password
  };

  return apiData;
};

// 단체신청 데이터 변환
export const transformGroupFormDataToApi = (formData: GroupFormData, eventInfo: any): GroupApiRequestData => {
  
  // 단체 정보에서 기념품 정보를 JSON으로 변환
  const souvenirJson = formData.participants.map(participant => ({
    category: participant.category,
    souvenir: participant.souvenir,
    size: participant.size
  }));

  const result = {
    organizationCreateRequest: {
      organizationAccount: {
        organizationName: formData.groupName,
        organizationAccount: formData.groupId,
        organizationPassword: formData.groupPassword
      },
      organizationProfile: {
          address: {
            address: formData.address || '', // 단일 문자열 주소 (개인신청과 동일)
            zipCode: formData.postalCode || '',
            addressDetail: formData.detailedAddress || ''
          },
        birth: formData.representativeBirthDate,
        phNum: formatPhoneNumber(formData.phone1, formData.phone2, formData.phone3),
        email: formatEmail(formData.email1, formData.emailDomain, ''),
        leaderName: formData.leaderName
      },
      paymentDefaultInfo: {
        paymentType: formData.paymentMethod === 'bank_transfer' ? 'ACCOUNT_TRANSFER' : 'CARD',
        paymenterName: formData.depositorName
      }
    },
    registrationInfoPerUserList: formData.participants.map((participant, index) => {
      // 참가자 데이터 유효성 검사
      if (!participant.category || participant.category === '종목' || participant.category === '') {
        throw new Error(`참가자 ${index + 1}: 참가종목을 선택해주세요.`);
      }
      
      if (!participant.souvenir || participant.souvenir === '선택' || participant.souvenir === '') {
        throw new Error(`참가자 ${index + 1}: 기념품을 선택해주세요.`);
      }
      
      if (!participant.size || participant.size === '사이즈' || participant.size === '' || participant.size === '선택') {
        throw new Error(`참가자 ${index + 1}: 사이즈를 선택해주세요.`);
      }
      
      // 이벤트 정보에서 올바른 카테고리와 기념품 찾기
      const selectedCategory = eventInfo?.categorySouvenirList?.find(
        (c: any) => c.categoryName === participant.category
      );

      if (!selectedCategory) {
        throw new Error(`참가자 ${index + 1}: 선택된 카테고리를 찾을 수 없습니다.`);
      }

      const selectedSouvenir = selectedCategory.categorySouvenirPair?.find(
        (s: any) => String(s.souvenirId) === String(participant.souvenir)
      );

      if (!selectedSouvenir) {
        throw new Error(`참가자 ${index + 1}: 선택된 기념품을 찾을 수 없습니다.`);
      }

      // 서버에서 받은 정확한 사이즈 값 찾기
      const exactSize = selectedSouvenir.souvenirSize?.find((size: any) => 
        size.trim() === participant.size.trim()
      );

      if (!exactSize) {
        throw new Error(`참가자 ${index + 1}: 선택된 사이즈를 찾을 수 없습니다.`);
      }
      
      const registrationInfo: any = {
        eventCategoryId: selectedCategory.categoryId,
        souvenir: (() => {
          // 1) selectedSouvenirs 우선 (다중 선택)
          if (participant.selectedSouvenirs && participant.selectedSouvenirs.length > 0) {
            return participant.selectedSouvenirs.map(sel => {
              const matched = selectedCategory.categorySouvenirPair.find((s: any) => String(s.souvenirId) === String(sel.souvenirId));
              const size = matched?.souvenirSize?.find((sz: any) => sz.trim() === sel.size.trim()) || sel.size || '사이즈 없음';
              // 기념품 없음 처리
              const isNoSouvenir = matched?.souvenirName === '기념품 없음' || matched?.souvenirId === '0' || matched?.souvenirId === '1' || matched?.souvenirId === '2';
              return {
                souvenirId: `${matched ? matched.souvenirId : sel.souvenirId}`,
                selectedSize: isNoSouvenir ? '사이즈 없음' : String(size).trim()
              };
            });
          }
          // 2) 하위호환: 단일 선택(souvenir/size)
          const isNoSouvenir = selectedSouvenir.souvenirName === '기념품 없음' || 
                              selectedSouvenir.souvenirId === '0' || 
                              selectedSouvenir.souvenirId === '1' ||
                              selectedSouvenir.souvenirId === '2';
          return [
            {
              souvenirId: `${selectedSouvenir.souvenirId}`,
              selectedSize: isNoSouvenir ? '사이즈 없음' : exactSize.trim()
            }
          ];
        })()
      };
      
      // note가 있을 때만 추가 (UI에서 사용하는 필드)
      if (participant.note && participant.note.trim().length > 0) {
        registrationInfo.note = participant.note;
      }
      
      const transformedParticipant = {
        mustRegistrationInfo: {
          personalInfo: {
            birth: formatBirthDate(participant.birthYear, participant.birthMonth, participant.birthDay),
            name: participant.name,
            phNum: formatPhoneNumber(participant.phone1, participant.phone2, participant.phone3),
            gender: participant.gender === 'male' ? 'M' : participant.gender === 'female' ? 'F' : participant.gender
          },
          registrationInfo
        }
      };

      
      return transformedParticipant;
    })
  };
  
  return result;
};

// 단체신청 수정용 데이터 변환 (organizationPatchRequest 구조에 맞춤)
export const transformGroupFormDataToUpdateApi = (
  formData: GroupFormData,
  eventInfo: EventRegistrationInfo | null,
  originalData?: any // 원본 데이터 추가
): any => {
  if (!eventInfo) {
    throw new Error('이벤트 정보가 없습니다.');
  }
  
  if (!originalData) {
    throw new Error('수정 모드에서는 원본 데이터가 필요합니다.');
  }

  // 참가자별 기념품 정보 생성 (다중 선택 지원)
  const registrationInfoPerUserList = formData.participants.map((participant, index) => {
    const selectedCategory = eventInfo.categorySouvenirList.find(
      c => c.categoryName === participant.category
    );

    if (!selectedCategory) {
      throw new Error(`선택된 카테고리 "${participant.category}"를 찾을 수 없습니다.`);
    }

    // 수정 모드에서 기념품 찾기 (CREATE 함수와 동일한 로직 적용)
    let selectedSouvenir;
    if (participant.souvenir.length > 10) {
      // UUID 형태라면 souvenirId로 찾기
      selectedSouvenir = selectedCategory.categorySouvenirPair.find(
        s => s.souvenirId === participant.souvenir
      );
    } else {
      // 짧은 ID나 이름이라면 souvenirId로 먼저 찾기
      selectedSouvenir = selectedCategory.categorySouvenirPair.find(
        s => String(s.souvenirId) === String(participant.souvenir)
      );
      
      // ID로 찾지 못했다면 souvenirName으로 찾기
      if (!selectedSouvenir) {
        selectedSouvenir = selectedCategory.categorySouvenirPair.find(
          s => s.souvenirName === participant.souvenir
        );
      }
    }

    if (!selectedSouvenir) {
      throw new Error(`참가자 ${index + 1}: 선택된 기념품 "${participant.souvenir}"를 찾을 수 없습니다.`);
    }

    // 서버에서 받은 정확한 사이즈 값 찾기 (단일 모드용)
    const exactSize = selectedSouvenir.souvenirSize?.find((size: any) => size.trim() === participant.size.trim()) || '사이즈 없음';

    const registrationInfo: any = {
      eventCategoryId: selectedCategory.categoryId,
      souvenir: (() => {
        // 1) 다중 선택 우선 사용
        if (participant.selectedSouvenirs && participant.selectedSouvenirs.length > 0) {
          return participant.selectedSouvenirs.map(sel => {
            const matched = selectedCategory.categorySouvenirPair.find((s: any) => String(s.souvenirId) === String(sel.souvenirId));
            const size = matched?.souvenirSize?.find((sz: any) => sz.trim() === sel.size.trim()) || sel.size || '사이즈 없음';
            const isNoSouvenir = matched?.souvenirName === '기념품 없음' || matched?.souvenirId === '0' || matched?.souvenirId === '1' || matched?.souvenirId === '2';
            return {
              souvenirId: `${matched ? matched.souvenirId : sel.souvenirId}`,
              selectedSize: isNoSouvenir ? '사이즈 없음' : String(size).trim()
            };
          });
        }
        // 2) 하위호환: 단일 선택
        const isNoSouvenir = selectedSouvenir.souvenirName === '기념품 없음' || selectedSouvenir.souvenirId === '0' || selectedSouvenir.souvenirId === '1' || selectedSouvenir.souvenirId === '2';
        return [{
          souvenirId: `${selectedSouvenir.souvenirId}`,
          selectedSize: isNoSouvenir ? '사이즈 없음' : String(exactSize).trim()
        }];
      })()
    };
    
    // note가 있을 때만 추가 (UI에서 사용하는 필드)
    if (participant.note && participant.note.trim().length > 0) {
      registrationInfo.note = participant.note;
    }
    
    return {
      mustRegistrationInfo: {
        personalInfo: {
          birth: formatBirthDate(participant.birthYear, participant.birthMonth, participant.birthDay),
          name: participant.name,
          phNum: formatPhoneNumber(participant.phone1, participant.phone2, participant.phone3),
          gender: participant.gender === 'male' ? 'M' : participant.gender === 'female' ? 'F' : participant.gender
        },
        registrationInfo
      }
    };
  });


  // 단체신청 수정용 API 스키마에 맞춰 데이터 변환
  const apiData = {
    organizationPatchRequest: {
      organizationPatchAccount: {
        organizationName: formData.groupName,
        organizationAccount: formData.groupId,
        organizationPassword: formData.groupPassword
      },
      organizationProfile: {
        address: {
          address: formData.address || '', // 단일 문자열 주소 (개인신청과 동일)
          zipCode: formData.postalCode || '',
          addressDetail: formData.detailedAddress || ''
        },
        birth: formData.representativeBirthDate,
        phNum: formatPhoneNumber(formData.phone1, formData.phone2, formData.phone3),
        email: formatEmail(formData.email1, formData.emailDomain, ''),
        leaderName: formData.leaderName
      },
      paymentDefaultInfo: {
        paymentType: formData.paymentMethod === 'bank_transfer' ? 'ACCOUNT_TRANSFER' : 'CARD',
        paymenterName: formData.depositorName
      }
    },
    registrationInfoPerUserList: registrationInfoPerUserList,
    registrationId: originalData?.innerUserRegistrationList?.[0]?.registrationId // registrationId를 Request Body에 추가
  };

  return apiData;
};
