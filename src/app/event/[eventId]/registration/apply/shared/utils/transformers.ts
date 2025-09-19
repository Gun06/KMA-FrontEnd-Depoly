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

  const selectedSouvenir = selectedCategory.categorySouvenirPair.find(
    s => s.souvenirId === formData.souvenir
  );

  if (!selectedSouvenir) {
    throw new Error('선택된 기념품을 찾을 수 없습니다.');
  }

  // 서버에서 받은 정확한 사이즈 값 찾기
  const exactSize = selectedSouvenir.souvenirSize.find(size => 
    size.trim() === formData.size.trim()
  );

  if (!exactSize) {
    throw new Error('선택된 사이즈를 찾을 수 없습니다.');
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
        registrationInfo: {
          eventCategoryId: selectedCategory.categoryId,
          souvenir: [
            {
              souvenirId: selectedSouvenir.souvenirId,
              selectedSize: exactSize.trim() // 공백 제거하여 전송
            }
          ]
        }
      },
      address: {
        siDo: formData.address.split(' ')[0] || '',
        siGunGu: formData.address.split(' ').slice(1).join(' ') || '',
        roadAddress: formData.address,
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
          siDo: formData.address.split(' ')[0] || '',
          siGunGu: formData.address.split(' ').slice(1).join(' ') || '',
          roadAddress: formData.address,
          zipCode: formData.postalCode,
          addressDetail: formData.detailedAddress
        },
        birth: formData.representativeBirthDate,
        phNum: formatPhoneNumber(formData.phone1, formData.phone2, formData.phone3),
        email: formatEmail(formData.email1, formData.emailDomain, formData.email2),
        leaderName: formData.leaderName
      },
      paymentDefaultInfo: {
        paymentType: formData.paymentMethod === 'bank_transfer' ? 'ACCOUNT_TRANSFER' : 'CARD',
        paymenterName: formData.depositorName
      },
      souvenir_json: JSON.stringify(souvenirJson),
      souvenirJson: JSON.stringify(souvenirJson),
      souvenir: JSON.stringify(souvenirJson)
    },
    registrationInfoPerUserList: formData.participants.map((participant, index) => {
      // 참가자 데이터 유효성 검사
      if (!participant.category || participant.category === '종목' || participant.category === '') {
        throw new Error(`참가자 ${index + 1}: 참가종목을 선택해주세요.`);
      }
      
      if (!participant.souvenir || participant.souvenir === '선택' || participant.souvenir === '0' || participant.souvenir === '') {
        throw new Error(`참가자 ${index + 1}: 기념품을 선택해주세요.`);
      }
      
      if (!participant.size || participant.size === '사이즈' || participant.size === '') {
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
        (s: any) => s.souvenirId === participant.souvenir
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
      
      const transformedParticipant = {
        mustRegistrationInfo: {
          personalInfo: {
            birth: formatBirthDate(participant.birthYear, participant.birthMonth, participant.birthDay),
            name: participant.name,
            phNum: formatPhoneNumber(participant.phone1, participant.phone2, participant.phone3),
            email: formatEmail(participant.email1, participant.emailDomain, participant.email2),
            gender: participant.gender === 'male' ? 'M' : participant.gender === 'female' ? 'F' : participant.gender
          },
          registrationInfo: {
            eventCategoryId: selectedCategory.categoryId,
            souvenir: [
              {
                souvenirId: selectedSouvenir.souvenirId,
                selectedSize: exactSize.trim() // 공백 제거하여 전송
              }
            ]
          }
        }
      };
      
      return transformedParticipant;
    })
  };
  
  return result;
};
