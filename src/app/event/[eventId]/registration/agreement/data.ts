export interface AgreementData {
  eventName: string;
  organizationName: string;
}

const DEFAULT_AGREEMENT: AgreementData = {
  eventName: '청주마라톤',
  organizationName: '청주마라톤 조직위원회',
};

/** @deprecated useAgreementData 훅 사용 */
export const getAgreementData = (eventId: string): AgreementData => {
  if (typeof window !== 'undefined' && eventId) {
    const preloaded = (
      window as Window & {
        __KMA_EVENT_INFO__?: Record<string, { nameKr?: string }>;
      }
    ).__KMA_EVENT_INFO__?.[eventId];
    if (preloaded?.nameKr) {
      return {
        eventName: preloaded.nameKr,
        organizationName: `${preloaded.nameKr} 조직위원회`,
      };
    }
  }

  return DEFAULT_AGREEMENT;
};
