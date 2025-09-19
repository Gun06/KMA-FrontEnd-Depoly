export interface AgreementData {
  eventName: string;
  organizationName: string;
}

export const getAgreementData = (eventId: string): AgreementData => {
  // eventId에 따라 다른 대회 정보 반환
  const eventData: Record<string, AgreementData> = {
    'marathon2025': {
      eventName: '청주마라톤',
      organizationName: '청주마라톤 조직위원회'
    }
    // 다른 대회들도 여기에 추가 가능
  };

  // 기본값으로 marathon2025 사용
  return eventData[eventId] || eventData['marathon2025'];
};
