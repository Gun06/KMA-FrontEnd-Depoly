import type { MainBannerResponse, MainBannerInfo } from '@/types/mainBanner';
import type { UploadItem } from '@/components/common/Upload/types';
import type { MainBannerRowType } from '../types';

// API 응답을 로컬 상태로 변환
export function convertApiToLocal(apiBanners: MainBannerResponse[]): MainBannerRowType[] {
  return apiBanners.map((banner, index) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subTitle,
    date: banner.date,
    eventId: banner.eventId,
    image: banner.imageUrl ? {
      id: banner.id,
      file: new File([], 'image.jpg'),
      name: banner.imageUrl.split('/').pop() || 'image.jpg',
      size: 1000000,
      sizeMB: 1,
      tooLarge: false,
      url: banner.imageUrl,
      previewUrl: banner.imageUrl
    } as UploadItem : null,
    visible: true,
    draft: false,
    orderNo: banner.orderNo || index + 1
  }));
}

// 로컬 데이터를 API 형식으로 변환
export function convertLocalToApi(rows: MainBannerRowType[]): { mainBannerInfos: MainBannerInfo[], images: File[] } {
  const mainBannerInfos: MainBannerInfo[] = [];
  const images: File[] = [];
  
  rows.forEach((row, index) => {
    // eventId 검증
    if (!row.eventId || row.eventId.trim() === '') {
      return; // eventId가 없으면 해당 행을 건너뜀
    }
    
    if (row.draft) {
      // 새로 생성되는 배너
      mainBannerInfos.push({
        id: null,
        title: row.title,
        subtitle: row.subtitle,
        date: row.date,
        eventId: row.eventId,
        orderNo: index + 1,
      });
      
      // 새로 생성되는 배너의 이미지 파일 추가
      if (row.image && 'file' in row.image && row.image.file instanceof File && row.image.file.size > 0) {
        images.push(row.image.file);
      }
    } else {
      // 기존 배너 수정
      mainBannerInfos.push({
        id: typeof row.id === 'string' ? row.id : row.id.toString(),
        title: row.title,
        subtitle: row.subtitle,
        date: row.date,
        eventId: row.eventId,
        orderNo: index + 1,
      });
    }
  });
  
  return { mainBannerInfos, images };
}

