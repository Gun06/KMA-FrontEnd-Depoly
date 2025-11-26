export interface AgreementData {
  eventName: string;
  organizationName: string;
}

export const getAgreementData = (eventId: string): AgreementData => {
  // 클라이언트 환경에서만 동작
  if (typeof window !== 'undefined' && eventId) {
    // 1) 사전 주입된 전역 데이터가 있으면 즉시 사용 (SSR/상위 컴포넌트 프리로드)
    const preloaded = (window as any).__KMA_EVENT_INFO__?.[eventId];
    if (preloaded?.nameKr) {
      return { eventName: preloaded.nameKr, organizationName: `${preloaded.nameKr} 조직위원회` };
    }

    // 2) 로컬 캐시가 있으면 우선 사용
    try {
      const cached = localStorage.getItem(`hero_main_${eventId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const info = parsed?.data;
        if (info?.nameKr) {
          // 백그라운드에서 최신 데이터 갱신 시도
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
          if (API_BASE_URL) {
            const endpoint = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
            fetch(endpoint)
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.nameKr) {
                  try { localStorage.setItem(`hero_main_${eventId}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
                }
              })
              .catch(() => {});
          }
          return { eventName: info.nameKr, organizationName: `${info.nameKr} 조직위원회` };
        }
      }
    } catch {}

    // 3) 캐시가 없다면 백그라운드로 API 호출하여 캐시만 갱신하고 기본값 반환
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      if (API_BASE_URL) {
        const endpoint = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
        fetch(endpoint)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.nameKr) {
              try { localStorage.setItem(`hero_main_${eventId}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
            }
          })
          .catch(() => {});
      }
    } catch {}
  }

  // 4) 최종 기본값
  return { eventName: '청주마라톤', organizationName: '청주마라톤 조직위원회' };
};
