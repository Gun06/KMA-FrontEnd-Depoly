import { StaticImageData } from 'next/image';

// TopSection 데이터 타입 정의 (ActionButton 설정 제거)
export interface TopSectionConfig {
  id: string;
  eventId: string;
  title: {
    english: string;
    korean: string;
  };
  subtitle: string;
  backgroundImage?: {
    desktop?: string | StaticImageData;
    mobile?: string | StaticImageData;
  };
  useGradientBackground?: boolean;
  textColor?: string;
}

// 기본 TopSection 설정
export const defaultTopSectionConfig: TopSectionConfig = {
  id: 'cheongju-marathon-2025',
  eventId: 'marathon2025',
  title: {
    english: 'CHEONGJU MARATHON',
    korean: '2025 청주마라톤'
  },
  subtitle: '2025.10.25(토) 청주 무심천',
  useGradientBackground: true,
  textColor: 'text-white'
};

// 이벤트별 TopSection 설정 (관리자에서 관리할 데이터)
export const topSectionConfigs: Record<string, TopSectionConfig> = {
  'marathon2025': {
    ...defaultTopSectionConfig,
    // 이 부분은 나중에 관리자 사이트에서 동적으로 로드될 예정
    backgroundImage: {
      // desktop: '/api/events/marathon2025/images/desktop-bg',
      // mobile: '/api/events/marathon2025/images/mobile-bg'
    }
  },
  
  // 다른 이벤트 설정 예시
  'seoul-marathon-2025': {
    id: 'seoul-marathon-2025',
    eventId: 'seoul-2025',
    title: {
      english: 'SEOUL MARATHON',
      korean: '2025 서울마라톤'
    },
    subtitle: '2025.03.16(일) 서울 광화문',
    useGradientBackground: true,
    textColor: 'text-white'
  }
};

// TopSection 설정 가져오기 함수
export const getTopSectionConfig = (eventId: string): TopSectionConfig => {
  return topSectionConfigs[eventId] || topSectionConfigs['marathon2025'] || defaultTopSectionConfig;
};

// 관리자 API에서 설정을 업데이트하는 함수 (나중에 구현)
export const updateTopSectionConfig = async (
  eventId: string, 
  config: Partial<TopSectionConfig>
): Promise<TopSectionConfig> => {
  // TODO: 관리자 API 호출
  // const response = await fetch(`/api/admin/events/${eventId}/topsection`, {
  //   method: 'PUT',
  //   body: JSON.stringify(config)
  // });
  // return response.json();
  
  // 임시로 로컬 업데이트
  topSectionConfigs[eventId] = { ...topSectionConfigs[eventId], ...config };
  return topSectionConfigs[eventId];
};
