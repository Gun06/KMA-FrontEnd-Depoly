// src/app/admin/events/register/api/formDataBuilder.ts

import type {
  EventCreateRequest,
  EventUpdateRequest,
  EventImageFiles,
  EventCreatePayload,
  EventCategoryUpdateInfo,
  EventBannerUpdateInfo,
} from './types';
import { EventDataTransformer } from './eventDataTransformer';

/**
 * 대회 생성 API 요청을 위한 FormData를 생성하는 유틸리티
 */
export class FormDataBuilder {
  /**
   * 대회 생성 요청을 위한 FormData 생성
   */
  static buildEventCreateFormData(
    eventCreateRequest: EventCreateRequest,
    imageFiles: EventImageFiles
  ): FormData {
    const formData = new FormData();

    // 1. JSON 데이터 추가 (eventCreateRequest)
    formData.append('eventCreateRequest', JSON.stringify(eventCreateRequest));

    // 2. 필수 이미지 파일들 추가
    this.appendRequiredImages(formData, imageFiles);

    // 3. 주최/주관/후원 배너 이미지들 추가 (순서 중요!)
    this.appendBannerImages(formData, imageFiles);

    return formData;
  }

  /**
   * 필수 이미지 파일들을 FormData에 추가
   */
  private static appendRequiredImages(
    formData: FormData,
    imageFiles: EventImageFiles
  ): void {
    // 공용: 크로스-리얼름 File/Blob도 수용하여 안전하게 append
    const toBlobAndName = (
      maybeFile: unknown,
      fallbackName: string
    ): { blob: Blob; name: string } => {
      if (maybeFile && typeof maybeFile === 'object') {
        const anyFile = maybeFile as {
          name?: unknown;
          size?: unknown;
          type?: unknown;
          slice?: unknown;
        };
        const hasBlobShape =
          typeof anyFile.size === 'number' &&
          typeof (anyFile as Blob).slice === 'function';
        const name =
          typeof anyFile.name === 'string' ? anyFile.name : fallbackName;
        if (hasBlobShape) {
          return { blob: anyFile as unknown as Blob, name };
        }
      }
      // fallback: 0-byte PNG placeholder
      return {
        blob: new Blob([''], { type: 'image/png' }),
        name: fallbackName,
      };
    };

    // 1) 상단 배너 4종은 키가 반드시 포함되도록 보장 (없으면 placeholder)
    type BannerKey =
      | 'mainBannerPcImage'
      | 'mainBannerMobileImage'
      | 'mainOutlinePcImage'
      | 'mainOutlineMobileImage';

    const bannerPairs: Array<{
      key: BannerKey;
      formKey: string;
      fallback: string;
    }> = [
      {
        key: 'mainBannerPcImage',
        formKey: 'mainBannerPcImage',
        fallback: 'mainBannerPcImage.png',
      },
      {
        key: 'mainBannerMobileImage',
        formKey: 'mainBannerMobileImage',
        fallback: 'mainBannerMobileImage.png',
      },
      {
        key: 'mainOutlinePcImage',
        formKey: 'mainOutlinePcImage',
        fallback: 'mainOutlinePcImage.png',
      },
      {
        key: 'mainOutlineMobileImage',
        formKey: 'mainOutlineMobileImage',
        fallback: 'mainOutlineMobileImage.png',
      },
    ];

    for (const { key, formKey, fallback } of bannerPairs) {
      // 키를 반드시 포함 — 서버 측에서 키 존재 여부로 분기할 수 있게 함
      const { blob, name } = toBlobAndName(
        imageFiles[key] as unknown,
        fallback
      );
      formData.append(formKey, blob, name);
    }

    // 2) 나머지 필수/선택 이미지들 — 존재 시 추가
    const otherImages = [
      { key: 'eventOutlineImage', file: imageFiles.eventOutlineImage },
      { key: 'promotionBannerImage', file: imageFiles.promotionBannerImage },
      { key: 'souvenirImage', file: imageFiles.souvenirImage },
      { key: 'noticeImage', file: imageFiles.noticeImage },
      { key: 'meetingPlaceImage', file: imageFiles.meetingPlaceImage },
      { key: 'resultImage', file: imageFiles.resultImage },
      { key: 'courseImage', file: imageFiles.courseImage },
      // 선택: 사이드메뉴 배너(herosection 이미지)
      { key: 'sideMenuBannerImage', file: imageFiles.sideMenuBannerImage },
    ];

    for (const { key, file } of otherImages) {
      if (file) {
        const { blob, name } = toBlobAndName(
          file as unknown,
          `${String(key)}.png`
        );
        formData.append(key, blob, name);
      }
    }
  }

  /**
   * 주최/주관/후원 배너 이미지들을 FormData에 추가
   * eventBannerInfoList와 동일한 순서로 추가해야 함
   */
  private static appendBannerImages(
    formData: FormData,
    imageFiles: EventImageFiles
  ): void {
    if (
      imageFiles.eventBannerImages &&
      imageFiles.eventBannerImages.length > 0
    ) {
      for (let i = 0; i < imageFiles.eventBannerImages.length; i++) {
        const bannerImage = imageFiles.eventBannerImages[i];
        formData.append('eventBannerImages', bannerImage);
      }
    } else {
      // no-op
    }
  }

  /**
   * 대회 수정 요청을 위한 FormData 생성
   */
  static buildEventUpdateFormData(
    eventId: string,
    payload: EventCreatePayload,
    existingCategories?: Array<{
      id: string;
      name: string;
      amount: number;
      souvenirs: Array<{
        id: string;
        name: string;
        sizes: string;
        eventCategoryId: string;
      }>;
    }>,
    existingEventBanners?: Array<{
      id: string;
      imageUrl: string;
      url: string;
      providerName: string;
      bannerType: string;
      static: boolean;
    }>,
    existingEventStatus?: string // 기존 eventStatus 추가
  ): FormData {
    const formData = new FormData();

    // 기존 카테고리 ID 매핑 생성
    const categoryIdMap = new Map<string, string>();
    const souvenirIdMap = new Map<string, string>();

    if (existingCategories) {
      existingCategories.forEach(category => {
        // 카테고리 이름으로 ID 매핑
        categoryIdMap.set(category.name, category.id);

        // 기념품 ID 매핑 (카테고리 ID + 이름 + 사이즈로 매핑하여 중복 방지)
        if (category.souvenirs && Array.isArray(category.souvenirs)) {
          category.souvenirs.forEach(souvenir => {
            // 카테고리 ID를 포함하여 고유한 키 생성
            const key = `${category.id}_${souvenir.name}_${souvenir.sizes}`;
            souvenirIdMap.set(key, souvenir.id);
          });
        }
      });
    }

    // partners + 기존 배너 정보를 기반으로 항상 업데이트 목록을 생성
    const eventBannerInfoList = this.buildEventBannerInfoList(
      payload,
      existingEventBanners
    );

    // 2. 이미지 파일들 추가하고, 파일이 없는 imageUrl === null 항목 추적
    const bannersWithoutFiles = this.appendUpdateImages(
      formData,
      payload,
      eventBannerInfoList
    );

    // 파일이 없는 imageUrl === null 항목 제외 (이미지 개수와 정보 개수 일치를 위해)
    const validBannerInfoList = eventBannerInfoList.filter(banner => {
      if (banner.imageUrl === null) {
        // imageUrl === null인 항목은 반드시 파일이 있어야 함
        const key = `${banner.bannerType}::${banner.providerName}`;
        return !bannersWithoutFiles.has(key);
      }
      return true;
    });

    // EventDataTransformer를 사용하여 eventInfo 생성
    const { eventCreateRequest } = EventDataTransformer.transformToServerFormat(payload);
    const eventInfo = eventCreateRequest.eventInfo;

    // eventBannerUpdateInfo 생성 (새로운 API 스펙: imageUrl 포함)
    const eventBannerUpdateInfo: EventBannerUpdateInfo[] = validBannerInfoList.map(banner => ({
      imageUrl: banner.imageUrl || undefined, // null이면 undefined로 변환
      providerName: banner.providerName,
      url: banner.url,
      bannerType: banner.bannerType,
      static: banner.static,
    }));

    // eventCategoryUpdateInfo 생성 (기념품/종목은 나중에 별도 API로 전송 예정이므로 일단 빈 배열)
    // TODO: 기념품/종목 API 연동 후 구현
    const eventCategoryUpdateInfo: EventCategoryUpdateInfo[] = [];

    // 1. JSON 데이터 구성 (새로운 API 스펙에 맞게)
    const eventUpdateRequest: EventUpdateRequest = {
      eventInfo,
      eventCategoryUpdateInfo,
      eventBannerUpdateInfo,
    };

    formData.append('eventCreateRequest', JSON.stringify(eventUpdateRequest));



    return formData;
  }

  /**
   * partners 정보에서 배너 정보 목록 구성
   * 수정된 배너는 imageUrl을 null로, 수정하지 않은 배너는 기존 URL 유지
   * 주관명만 수정한 경우에도 기존 배너 ID를 포함하여 업데이트로 처리
   */
  private static buildEventBannerInfoList(
    payload: EventCreatePayload,
    existingEventBanners?: Array<{
      id: string;
      imageUrl: string;
      url: string;
      providerName: string;
      bannerType: string;
      static: boolean;
    }>
  ): Array<{
    imageUrl: string | null;
    providerName: string;
    url: string;
    bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST';
    static: boolean;
  }> {
    // 기존 배너를 imageUrl로 매칭하기 위한 맵 생성 (서버 순서 변경과 관계없이 매칭)
    const existingBannerMap = new Map<string, {
      imageUrl: string;
      url: string;
      providerName: string;
      bannerType: string;
      static: boolean;
    }>();
    (existingEventBanners || []).forEach(b => {
      // imageUrl을 키로 사용 (서버에서 순서가 바뀌어도 매칭 가능)
      if (b.imageUrl) {
        existingBannerMap.set(b.imageUrl, {
          imageUrl: b.imageUrl,
          url: b.url,
          providerName: b.providerName,
          bannerType: b.bannerType,
          static: b.static,
        });
      }
    });

    // 파일 업로드 확인 헬퍼
    const hasNewFile = (files?: Array<{ file?: unknown; url?: string }>) =>
      !!files?.some(
        x => x && x.file instanceof File && (x.file as File).size > 0
      );

    // 기존 이미지 URL 추출 헬퍼
    const getExistingImageUrl = (files?: Array<{ file?: unknown; url?: string }>) => {
      if (!files || files.length === 0) return null;
      
      // file 배열에서 url이 있고 새 파일이 없는 항목 찾기
      for (const item of files) {
        if (item.url) {
          // 새 파일이 있는지 확인 (file이 File 인스턴스이고 size가 0보다 큰 경우)
          const hasNewFile = item.file instanceof File && (item.file as File).size > 0;
          // 새 파일이 없으면 기존 이미지 URL 반환
          if (!hasNewFile) {
            return item.url;
          }
        }
      }
      
      return null;
    };

    // 사용자가 입력한 데이터를 그대로 보냄 (기념품 사이즈처럼, 백엔드가 처리)
    const result: Array<{
      imageUrl: string | null;
      providerName: string;
      url: string;
      bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST';
      static: boolean;
    }> = [];

    if (payload.partners) {
      // 주최 배너
      if (payload.partners.hosts) {
        payload.partners.hosts.forEach(h => {
          const trimmedName = (h.name || '').trim();
          if (!trimmedName) return;
          
          const newFile = hasNewFile(h.file);
          const existingImageUrl = getExistingImageUrl(h.file);
          const existingBanner = existingImageUrl ? existingBannerMap.get(existingImageUrl) : null;
          
          result.push({
            imageUrl: newFile ? null : (existingBanner?.imageUrl || null), // 새 파일이 있으면 null, 없으면 기존 imageUrl 유지
            providerName: trimmedName, // 사용자가 입력한 그대로
            url: h.link || '',
            bannerType: 'HOST',
            static: h.enabled === true,
          });
        });
      }

      // 주관 배너
      if (payload.partners.organizers) {
        payload.partners.organizers.forEach(o => {
          const trimmedName = (o.name || '').trim();
          if (!trimmedName) return;
          
          const newFile = hasNewFile(o.file);
          const existingImageUrl = getExistingImageUrl(o.file);
          const existingBanner = existingImageUrl ? existingBannerMap.get(existingImageUrl) : null;
          
          result.push({
            imageUrl: newFile ? null : (existingBanner?.imageUrl || null), // 새 파일이 있으면 null, 없으면 기존 imageUrl 유지
            providerName: trimmedName, // 사용자가 입력한 그대로
            url: o.link || '',
            bannerType: 'ORGANIZER',
            static: o.enabled === true,
          });
        });
      }

      // 후원 배너
      if (payload.partners.sponsors) {
        payload.partners.sponsors.forEach(s => {
          const trimmedName = (s.name || '').trim();
          if (!trimmedName) return;
          
          const newFile = hasNewFile(s.file);
          const existingImageUrl = getExistingImageUrl(s.file);
          let existingBanner = existingImageUrl ? existingBannerMap.get(existingImageUrl) : null;
          
          // imageUrl로 찾지 못한 경우, bannerType과 providerName으로 찾기 (fallback)
          if (!existingBanner && !newFile) {
            // existingBannerMap에서 SPONSOR 타입이고 providerName이 일치하는 배너 찾기
            for (const [imageUrl, banner] of existingBannerMap.entries()) {
              if (banner.bannerType === 'SPONSOR' && banner.providerName === trimmedName) {
                existingBanner = banner;
                break;
              }
            }
          }
          
          result.push({
            imageUrl: newFile ? null : (existingBanner?.imageUrl || null), // 새 파일이 있으면 null, 없으면 기존 imageUrl 유지
            providerName: trimmedName, // 사용자가 입력한 그대로
            url: s.link || '',
            bannerType: 'SPONSOR',
            static: s.enabled === true,
          });
        });
      }

      // 협력 ASSIST 배너
      if (payload.partners.assists) {
        payload.partners.assists.forEach(a => {
          const trimmedName = (a.name || '').trim();
          if (!trimmedName) return;
          
          const newFile = hasNewFile(a.file);
          const existingImageUrl = getExistingImageUrl(a.file);
          let existingBanner = existingImageUrl ? existingBannerMap.get(existingImageUrl) : null;
          
          // imageUrl로 찾지 못한 경우, bannerType과 providerName으로 찾기 (fallback)
          if (!existingBanner && !newFile) {
            // existingBannerMap에서 ASSIST 타입이고 providerName이 일치하는 배너 찾기
            for (const [imageUrl, banner] of existingBannerMap.entries()) {
              if (banner.bannerType === 'ASSIST' && banner.providerName === trimmedName) {
                existingBanner = banner;
                break;
              }
            }
          }
          
          result.push({
            imageUrl: newFile ? null : (existingBanner?.imageUrl || null), // 새 파일이 있으면 null, 없으면 기존 imageUrl 유지
            providerName: trimmedName, // 사용자가 입력한 그대로
            url: a.link || '',
            bannerType: 'ASSIST',
            static: a.enabled === true,
          });
        });
      }
    }

    return result;
  }

  /**
   * 수정용 이미지 파일들을 FormData에 추가
   * 서버에서 null 참조 에러를 방지하기 위해 필수 배너 이미지는 항상 포함
   * @returns 파일이 없는 imageUrl === null 항목들의 키 Set
   */
  private static appendUpdateImages(
    formData: FormData,
    payload: EventCreatePayload,
    eventBannerInfoList: Array<{
      imageUrl: string | null;
      providerName: string;
      url: string;
      bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST';
      static: boolean;
    }>
  ): Set<string> {
    const bannersWithoutFiles = new Set<string>();
    const uploads = payload.uploads || {};

    // 이미지가 있는지 확인하는 헬퍼 함수 (새로운 File 객체인지 확인)
    const hasImage = (uploadItems: unknown[]) => {
      if (!uploadItems || uploadItems.length === 0) return false;

      const firstItem = uploadItems[0] as { file?: unknown; url?: string };

      // 새로운 파일이 업로드된 경우 (File 객체가 있는 경우)
      if (
        firstItem?.file &&
        firstItem.file instanceof File &&
        (firstItem.file as File).size > 0
      ) {
        return true;
      }

      // 기존 이미지 URL만 있는 경우는 false (변경사항 없음)

      return false;
    };

    // 메인 배너 이미지들 - 새로운 파일이 있을 때만 전송
    if (hasImage(uploads.bannerMainDesktop || [])) {
      const file = uploads.bannerMainDesktop![0].file;
      if (file) {
        formData.append('mainBannerPcImage', file);
      }
    }

    if (hasImage(uploads.bannerMainMobile || [])) {
      const file = uploads.bannerMainMobile![0].file;
      if (file) {
        formData.append('mainBannerMobileImage', file);
      }
    }

    // 메인 요강 이미지들 - 새로운 파일이 있을 때만 전송
    if (hasImage(uploads.bannerGuideDesktop || [])) {
      const file = uploads.bannerGuideDesktop![0].file;
      if (file) {
        formData.append('mainOutlinePcImage', file);
      }
    }

    if (hasImage(uploads.bannerGuideMobile || [])) {
      const file = uploads.bannerGuideMobile![0].file;
      if (file) {
        formData.append('mainOutlineMobileImage', file);
      }
    }

    // 페이지별 이미지들 - 새로운 파일이 있을 때만 전송
    if (hasImage(uploads.imgPost || [])) {
      const file = uploads.imgPost![0].file;
      if (file) {
        formData.append('eventOutlineImage', file);
      }
    }

    if (hasImage(uploads.bannerInstagram || [])) {
      const file = uploads.bannerInstagram![0].file;
      if (file) {
        formData.append('promotionBannerImage', file);
      }
    }

    // 사이드메뉴배너(herosection 이미지)
    if (hasImage(uploads.bannerSideMenu || [])) {
      const file = uploads.bannerSideMenu![0].file;
      if (file) {
        formData.append('sideMenuBannerImage', file);
      }
    }

    if (hasImage(uploads.imgGift || [])) {
      const file = uploads.imgGift![0].file;
      if (file) {
        formData.append('souvenirImage', file);
      }
    }

    if (hasImage(uploads.imgNotice || [])) {
      const file = uploads.imgNotice![0].file;
      if (file) {
        formData.append('noticeImage', file);
      }
    }

    if (hasImage(uploads.imgConfirm || [])) {
      const file = uploads.imgConfirm![0].file;
      if (file) {
        formData.append('meetingPlaceImage', file);
      }
    }

    if (hasImage(uploads.imgResult || [])) {
      const file = uploads.imgResult![0].file;
      if (file) {
        formData.append('resultImage', file);
      }
    }

    if (hasImage(uploads.imgCourse || [])) {
      const file = uploads.imgCourse![0].file;
      if (file) {
        formData.append('courseImage', file);
      }
    }

    // 주최/주관/후원/협력 배너 이미지들 - eventBannerInfoList 순서에 맞춰 전송
    // imageUrl === null 인 항목들만 파일을 포함해야 함
    if (payload.partners && Array.isArray(eventBannerInfoList)) {
      const findPartnerFile = (
        type: 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST',
        providerName: string
      ): File | null => {
        const lists = payload.partners as Required<typeof payload.partners>;
        const pick = (
          items: Array<{ name?: string; file?: Array<{ file?: unknown }> }>
        ): File | null => {
          const partner = (items || []).find(
            p => (p.name || '').trim() === providerName.trim()
          );
          if (!partner || !partner.file) return null;
          const upload = partner.file.find(
            u => u && u.file instanceof File && (u.file as File).size > 0
          );
          return (upload?.file as File) ?? null;
        };

        if (type === 'HOST') {
          return pick(lists.hosts || []) ?? null;
        }
        if (type === 'ORGANIZER') {
          return pick(lists.organizers || []) ?? null;
        }
        if (type === 'SPONSOR') {
          return pick(lists.sponsors || []) ?? null;
        }
        if (type === 'ASSIST') {
          return pick(lists.assists || []) ?? null;
        }
        return null;
      };

      let index = 0;
      for (const info of eventBannerInfoList) {
        if (info.imageUrl === null) {
          const file = findPartnerFile(info.bannerType, info.providerName);
          if (file) {
            formData.append('eventBannerImages', file, `banner_${index}.png`);
            index += 1;
          } else {
            // 파일이 없는 imageUrl === null 항목 추적
            const key = `${info.bannerType}::${info.providerName}`;
            bannersWithoutFiles.add(key);
          }
        }
      }
    }

    return bannersWithoutFiles;
  }

}