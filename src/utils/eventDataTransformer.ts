// src/utils/eventDataTransformer.ts

import type { EventCreatePayload } from '@/types/Admin';
import type {
  EventCreateRequest,
  EventInfo,
  EventCategoryInfo,
  EventBannerInfo,
  EventImageFiles,
} from '@/types/Admin';
import type { UploadItem } from '@/components/common/Upload/types';

/**
 * 프론트엔드 폼 데이터를 서버 API 형식으로 변환하는 유틸리티 클래스
 */
export class EventDataTransformer {
  /**
   * 프론트엔드 데이터를 서버 형식으로 변환
   */
  static transformToServerFormat(frontendData: EventCreatePayload): {
    eventCreateRequest: EventCreateRequest;
    imageFiles: EventImageFiles;
  } {
    // 1. 기본 정보 변환
    const eventInfo = this.createEventInfo(frontendData);

    // 2. 카테고리 및 기념품 정보 변환
    const eventCategoryInfoList = this.createEventCategoryInfo(frontendData);

    // 3. 주최/주관/후원 배너 정보 변환
    const eventBannerInfoList = this.createEventBannerInfo(frontendData);

    // 4. 이미지 파일 정보 변환
    const imageFiles = this.createImageFiles(frontendData);

    // 5. 최종 요청 데이터 구성
    const eventCreateRequest: EventCreateRequest = {
      eventInfo,
      eventCategoryInfoList,
      eventBannerInfoList,
    };

    return { eventCreateRequest, imageFiles };
  }

  /**
   * 대회 기본 정보 생성
   */
  private static createEventInfo(data: EventCreatePayload): EventInfo {
    // applyStatus(접수중/비접수/접수마감)를 서버 eventStatus로 매핑
    const eventStatus: 'OPEN' | 'PENDING' | 'CLOSED' =
      data.applyStatus === '접수중'
        ? 'OPEN'
        : data.applyStatus === '접수마감'
          ? 'CLOSED'
          : 'PENDING';

    return {
      registMaximum: data.maxParticipants || 0,
      registStartDate: data.registStartDate,
      registDeadline: data.registDeadline || this.getDefaultDeadline(),
      startDate: data.startAt || new Date().toISOString(),
      nameKr: data.titleKo || '새 대회',
      nameEng: data.titleEn || '',
      eventType: 'KMA',
      region: data.place || '',
      eventPageUrl: data.eventPageUrl || '',
      mainBannerColor: data.eventTheme, // 테마 이름을 그대로 전송
      paymentDeadline: data.paymentDeadline || this.getDefaultDeadline(),
      eventStatus,
      // 결제 정보
      bank: data.bank || undefined,
      virtualAccount: data.virtualAccount || undefined,
    };
  }

  /**
   * 카테고리 및 기념품 정보 생성
   */
  private static createEventCategoryInfo(
    data: EventCreatePayload
  ): EventCategoryInfo[] {
    const groups = data.groups ?? [];

    // 새 구조: 코스명/가격 + 기념품-사이즈 조합
    if (groups.length > 0) {
      return groups
        .filter(g => g?.course?.name?.trim())
        .map(g => {
          const courseName = g.course.name.trim();
          const priceNum =
            typeof g.course.price === 'number'
              ? g.course.price
              : Number(g.course.price);

          const combinations = (g.gifts ?? [])
            .filter(x => (x.label ?? '').trim())
            .map(x => ({
              name: x.label.trim(),
              sizes: (x.size ?? '').trim(),
            }));

          return {
            name: courseName,
            price: Number.isFinite(priceNum) ? priceNum : 0,
            combinations,
          };
        })
        .filter(cat => Number.isFinite(cat.price) && cat.price > 0);
    }

    // 폴백: fees만 주어진 경우 → 이름/가격만으로 구성, 조합은 빈 배열
    const fees = (data.fees ?? [])
      .filter(
        f => (f.name ?? '').trim() && typeof f.price === 'number' && f.price > 0
      )
      .map(f => ({ name: f.name.trim(), price: f.price, combinations: [] }));

    return fees;
  }

  /**
   * 주최/주관/후원 배너 정보 생성
   */
  private static createEventBannerInfo(
    data: EventCreatePayload
  ): EventBannerInfo[] {
    const bannerInfoList: EventBannerInfo[] = [];

    const buildList = (
      type: EventBannerInfo['bannerType'],
      names: string[] | undefined,
      partners?: Array<{ name?: string; link?: string; enabled?: boolean }>
    ) => {
      const count = Math.max(names?.length ?? 0, partners?.length ?? 0);
      for (let i = 0; i < count; i++) {
        const p = partners?.[i];
        const providerName = (p?.name ?? names?.[i] ?? '').trim();
        if (!providerName) continue;
        bannerInfoList.push({
          providerName,
          url: p?.link ?? '',
          bannerType: type,
          static: p?.enabled !== false,
        });
      }
    };

    buildList('HOST', data.hosts, data.partners?.hosts);
    buildList('ORGANIZER', data.organizers, data.partners?.organizers);
    buildList('SPONSOR', data.sponsors, data.partners?.sponsors);

    return bannerInfoList;
  }

  /**
   * 이미지 파일 정보 생성
   */
  private static createImageFiles(data: EventCreatePayload): EventImageFiles {
    const uploads = data.uploads || {};

    // 디버그 로그 제거

    // 필수/선택 이미지 파일들
    const imageFiles: EventImageFiles = {
      // 메인 배너(필수로 간주: 없으면 default.png)
      mainBannerPcImage: this.getFileFromUpload(uploads.bannerMainDesktop?.[0]),
      mainBannerMobileImage: this.getFileFromUpload(
        uploads.bannerMainMobile?.[0]
      ),

      // 메인 페이지 대회요강(필수로 간주: 없으면 default.png)
      mainOutlinePcImage: this.getFileFromUpload(
        uploads.bannerGuideDesktop?.[0]
      ),
      mainOutlineMobileImage: this.getFileFromUpload(
        uploads.bannerGuideMobile?.[0]
      ),

      // 페이지별(필수)
      eventOutlineImage: this.getFileFromUpload(uploads.imgPost?.[0]),
      promotionBannerImage: this.getFileFromUpload(
        uploads.bannerInstagram?.[0]
      ),
      souvenirImage: this.getFileFromUpload(uploads.imgGift?.[0]),
      noticeImage: this.getFileFromUpload(uploads.imgNotice?.[0]),
      meetingPlaceImage: this.getFileFromUpload(uploads.imgConfirm?.[0]),
      resultImage: this.getFileFromUpload(uploads.imgResult?.[0]),
      // 코스 이미지는 별도 필드(imgCourse)를 우선 사용
      courseImage: this.getFileFromUpload(uploads.imgCourse?.[0]),
      // 사이드메뉴 배너(herosection 이미지) - 서버 NPE 방지를 위해 항상 File 생성
      sideMenuBannerImage: this.getFileFromUpload(
        uploads.bannerSideMenu?.[0]
      ),
    };

    // 주최/주관/후원 배너 이미지들 (순서 중요!)
    // eventBannerInfoList와 동일한 순서(Host들 → Organizer들 → Sponsor들)로 추가
    const bannerImages: File[] = [];

    if (uploads.bannerHost && uploads.bannerHost.length > 0) {
      for (const item of uploads.bannerHost) {
        bannerImages.push(this.getFileFromUpload(item));
      }
    }

    if (uploads.bannerOrganizer && uploads.bannerOrganizer.length > 0) {
      for (const item of uploads.bannerOrganizer) {
        bannerImages.push(this.getFileFromUpload(item));
      }
    }

    if (uploads.bannerSponsor && uploads.bannerSponsor.length > 0) {
      for (const item of uploads.bannerSponsor) {
        bannerImages.push(this.getFileFromUpload(item));
      }
    }

    if (bannerImages.length > 0) {
      imageFiles.eventBannerImages = bannerImages;
    }

    return imageFiles;
  }

  /**
   * UploadItem에서 File 객체 추출
   */
  private static getFileFromUpload(uploadItem?: UploadItem): File {
    // 디버그 로그 제거

    // 1) 일반 케이스: 브라우저 File 인스턴스
    if (uploadItem?.file && uploadItem.file instanceof File) {
      return uploadItem.file;
    }

    // 2) 크로스-리얼름 등으로 instanceof 실패시, File과 동등한 shape이면 그대로 사용
    if (uploadItem?.file && typeof uploadItem.file === 'object') {
      const f = uploadItem.file as unknown as {
        name?: unknown;
        size?: unknown;
      } & Blob;
      if (typeof f.name === 'string' && typeof f.size === 'number') {
        return f as unknown as File;
      }
    }

    // 파일이 없을 경우 빈 파일 생성 (API 요구사항 충족)
    return new File([''], 'default.png', { type: 'image/png' });
  }

  /**
   * 기본 마감일 생성 (현재 시간 + 30일)
   */
  private static getDefaultDeadline(): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    return deadline.toISOString();
  }

  /**
   * 이미지 파일 유효성 검증
   */
  static validateImages(imageFiles: EventImageFiles): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 1. 필수 이미지 검증 (메인/요강 배너 4종 포함)
    const requiredImages = [
      'mainBannerPcImage',
      'mainBannerMobileImage',
      'mainOutlinePcImage',
      'mainOutlineMobileImage',
      'eventOutlineImage',
      'promotionBannerImage',
      'souvenirImage',
      'noticeImage',
      'meetingPlaceImage',
      'resultImage',
      'courseImage',
    ] as const;

    for (const imageKey of requiredImages) {
      const file = imageFiles[imageKey];
      if (!file || file.size === 0 || file.name === 'default.png') {
        errors.push(
          `${imageKey} 이미지가 필요합니다. (현재: ${file?.name || '없음'})`
        );
      }
    }

    // 2. 주최/주관/후원 배너 이미지 검증 (선택사항이지만 업로드된 경우 유효성 검사)
    if (
      imageFiles.eventBannerImages &&
      imageFiles.eventBannerImages.length > 0
    ) {
      for (let i = 0; i < imageFiles.eventBannerImages.length; i++) {
        const bannerImage = imageFiles.eventBannerImages[i];
        if (
          !bannerImage ||
          bannerImage.size === 0 ||
          bannerImage.name === 'default.png'
        ) {
          errors.push(
            `${i + 1}번째 배너 이미지가 유효하지 않습니다. (현재: ${bannerImage?.name || '없음'})`
          );
        }
      }
    }

    // 디버그 로그 제거

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
