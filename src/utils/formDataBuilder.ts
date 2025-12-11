// src/utils/formDataBuilder.ts

import type {
  EventCreateRequest,
  EventImageFiles,
  EventCreatePayload,
} from '@/types/Admin';

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

    // 1. JSON 데이터 구성 (API 스펙에 맞게 - 서버에서 요청하는 필드만)
    const eventUpdateRequest = {
      eventInfo: {
        eventPageUrl: payload.eventPageUrl || '',
        registMaximum: payload.maxParticipants || 0,
        registStartDate: payload.registStartDate,
        registDeadline: payload.registDeadline,
        startDate: payload.startAt,
        nameKr: payload.titleKo,
        nameEng: payload.titleEn,
        eventType: 'KMA', // 기본값
        region: payload.place,
        mainBannerColor: payload.eventTheme || 'blue',
        paymentDeadline: payload.paymentDeadline,
        // 결제 정보(은행/계좌)
        bank: payload.bank || '',
        virtualAccount: payload.virtualAccount || '',
        host: payload.hosts?.join(', ') || '',
        organizer: payload.organizers?.join(', ') || '',
        // 공개여부: API 스펙 키는 visibleStatus
        visibleStatus: payload.visibility === '공개',
        // 신청상태 매핑: 접수중=OPEN, 비접수=PENDING, 접수마감=CLOSED
        // applyStatus가 명시적으로 전달된 경우에만 매핑, 없으면 기존 값 유지
        ...(payload.applyStatus !== undefined ? {
          eventStatus:
            payload.applyStatus === '접수중'
              ? 'OPEN'
              : payload.applyStatus === '비접수'
                ? 'PENDING'
                : payload.applyStatus === '접수마감'
                  ? 'CLOSED'
                  : (existingEventStatus || 'PENDING'), // 기존 값 유지 또는 기본값
        } : existingEventStatus ? {
          eventStatus: existingEventStatus, // applyStatus가 없으면 기존 값 유지
        } : {}),
      },
      eventCategoryUpdateInfo:
        payload.groups?.map(group => {
          // 기존 카테고리 ID 찾기 (있으면 업데이트, 없으면 새로 생성)
          const existingCategoryId = categoryIdMap.get(group.course.name) || '';

          return {
            id: existingCategoryId,
            name: group.course.name,
            price: group.course.price,
            souvenirUpdateInfo: group.gifts.map(gift => {
              // 기존 기념품 ID 찾기 (카테고리 ID 포함하여 정확한 매핑)
              // 카테고리 ID가 있으면 카테고리 ID를 포함한 키로 찾고, 없으면 이름+사이즈로 찾기 (하위 호환성)
              const keyWithCategory = existingCategoryId 
                ? `${existingCategoryId}_${gift.label}_${gift.size}`
                : `${gift.label}_${gift.size}`;
              const existingSouvenirId = souvenirIdMap.get(keyWithCategory) || '';

              return {
                id: existingSouvenirId,
                name: gift.label,
                sizes: gift.size,
              };
            }),
          };
        }) || [],
      eventBannerUpdateInfo: validBannerInfoList,
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
    bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR';
    static: boolean;
  }> {
    // 1) 기존 배너들을 기본 목록으로 채움 (ID 정보 포함)
    const bannerInfoList: Array<{
      id: string; // ID 추적용
      imageUrl: string | null;
      providerName: string; // 원본 이름 (정렬 번호 제거)
      url: string;
      bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR';
      static: boolean;
      used: boolean; // 매칭 여부 추적
    }> = (existingEventBanners || []).map(b => {
      // 기존 providerName에서 정렬 번호 제거 (형식: "번호|이름" 또는 "이름")
      const originalName = b.providerName.includes('|')
        ? b.providerName.split('|').slice(1).join('|').trim()
        : b.providerName.trim();
      
      return {
        id: b.id,
        imageUrl: b.imageUrl || null,
        providerName: originalName,
        url: b.url || '',
        bannerType: (b.bannerType as 'HOST' | 'ORGANIZER' | 'SPONSOR') || 'SPONSOR',
        static: !!b.static,
        used: false,
      };
    });

    // 매칭을 위한 헬퍼 (타입+이름 기준)
    const keyOf = (type: string, name?: string) => `${type}::${(name || '').trim()}`;
    const indexMap = new Map<string, number>();
    for (let i = 0; i < bannerInfoList.length; i++) {
      indexMap.set(keyOf(bannerInfoList[i].bannerType, bannerInfoList[i].providerName), i);
    }

    // 타입별 순서 추적 (같은 타입 내에서 순서 기반 매칭용)
    const typeIndexMap = new Map<'HOST' | 'ORGANIZER' | 'SPONSOR', number>();
    typeIndexMap.set('HOST', 0);
    typeIndexMap.set('ORGANIZER', 0);
    typeIndexMap.set('SPONSOR', 0);

    const upsert = (
      type: 'HOST' | 'ORGANIZER' | 'SPONSOR',
      name?: string,
      link?: string,
      enabled?: boolean,
      hasNewFile?: boolean
    ) => {
      const k = keyOf(type, name);
      const url = link || '';
      const staticFlag = enabled === true; // ON이 고정, OFF가 고정 아님
      const trimmedName = (name || '').trim();
      
      if (!trimmedName) return;

      if (indexMap.has(k)) {
        // 이름이 동일한 기존 항목을 찾음 (정확한 매칭)
        const i = indexMap.get(k)!;
        bannerInfoList[i] = {
          ...bannerInfoList[i],
          providerName: trimmedName, // 원본 이름만 저장 (정렬 번호는 나중에 추가)
          url,
          static: staticFlag,
          imageUrl: hasNewFile ? null : bannerInfoList[i].imageUrl, // 새 파일이 있으면 null, 없으면 기존 imageUrl 유지
          used: true,
        };
      } else {
        // 이름이 변경된 경우: 같은 타입 내에서 순서 기반으로 매칭 시도
        const typeIndex = typeIndexMap.get(type) || 0;
        const sameTypeBanners = bannerInfoList.filter(
          b => b.bannerType === type && !b.used
        );
        
        if (sameTypeBanners.length > 0 && typeIndex < sameTypeBanners.length) {
          // 순서 기반으로 기존 배너 찾기
          const matchedBanner = sameTypeBanners[typeIndex];
          const matchedIndex = bannerInfoList.findIndex(b => b.id === matchedBanner.id);
          
          if (matchedIndex >= 0) {
            // 기존 배너 업데이트 (주관명만 변경된 경우)
            bannerInfoList[matchedIndex] = {
              ...bannerInfoList[matchedIndex],
              providerName: trimmedName, // 원본 이름만 저장
              url,
              static: staticFlag,
              imageUrl: hasNewFile ? null : bannerInfoList[matchedIndex].imageUrl, // 새 파일이 있으면 null, 없으면 기존 imageUrl 유지
              used: true,
            };
            typeIndexMap.set(type, typeIndex + 1);
            return;
          }
        }
        
        // 신규 항목 추가 - 파일이 있는 경우에만 추가 (imageUrl === null인 항목은 반드시 파일이 있어야 함)
        // 파일이 없으면 정보에 포함하지 않음 (이미지 개수와 정보 개수 일치를 위해)
        if (hasNewFile) {
          bannerInfoList.push({
            id: '', // 신규는 ID 없음
            imageUrl: null, // 신규는 항상 null (파일이 있으므로)
            providerName: trimmedName, // 원본 이름만 저장
            url,
            bannerType: type,
            static: staticFlag,
            used: true,
          });
          typeIndexMap.set(type, typeIndex + 1);
        }
      }
    };

    // 2) partners 기준으로 변경분 반영 (파일 업로드 존재 시 imageUrl=null)
    const hasNewFile = (files?: Array<{ file?: unknown }>) =>
      !!files?.some(
        x => x && x.file instanceof File && (x.file as File).size > 0
      );

    if (payload.partners) {
      if (payload.partners.hosts) {
        payload.partners.hosts.forEach(h =>
          upsert('HOST', h.name, h.link, h.enabled, hasNewFile(h.file))
        );
      }
      if (payload.partners.organizers) {
        payload.partners.organizers.forEach(o =>
          upsert('ORGANIZER', o.name, o.link, o.enabled, hasNewFile(o.file))
        );
      }
      if (payload.partners.sponsors) {
        payload.partners.sponsors.forEach(s =>
          upsert('SPONSOR', s.name, s.link, s.enabled, hasNewFile(s.file))
        );
      }
    }

    // 3) 최종 결과 생성: 타입별, static별로 그룹화하여 정렬 번호 부여
    const result: Array<{
      imageUrl: string | null;
      providerName: string;
      url: string;
      bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR';
      static: boolean;
    }> = [];

    // 주최 → 주관 → 후원 순서
    const typeOrder: Array<'HOST' | 'ORGANIZER' | 'SPONSOR'> = ['HOST', 'ORGANIZER', 'SPONSOR'];
    
    for (const type of typeOrder) {
      // 같은 타입 내에서 static 여부별로 그룹화
      const staticBanners = bannerInfoList.filter(
        b => b.bannerType === type && b.static && (b.used || b.imageUrl)
      );
      const nonStaticBanners = bannerInfoList.filter(
        b => b.bannerType === type && !b.static && (b.used || b.imageUrl)
      );

      // 고정 배너들에 정렬 번호 부여 (1부터 시작)
      staticBanners.forEach((banner, index) => {
        result.push({
          imageUrl: banner.imageUrl,
          providerName: `${index + 1}|${banner.providerName}`, // "정렬 번호 | 제공자명" 형식
          url: banner.url,
          bannerType: banner.bannerType,
          static: banner.static,
        });
      });

      // 비고정 배너들에 정렬 번호 부여 (1부터 시작)
      nonStaticBanners.forEach((banner, index) => {
        result.push({
          imageUrl: banner.imageUrl,
          providerName: `${index + 1}|${banner.providerName}`, // "정렬 번호 | 제공자명" 형식
          url: banner.url,
          bannerType: banner.bannerType,
          static: banner.static,
        });
      });
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
      bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR';
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

    // 주최/주관/후원 배너 이미지들 - eventBannerInfoList 순서에 맞춰 전송
    // imageUrl === null 인 항목들만 파일을 포함해야 함
    if (payload.partners && Array.isArray(eventBannerInfoList)) {
      const findPartnerFile = (
        type: 'HOST' | 'ORGANIZER' | 'SPONSOR',
        providerName: string
      ): File | null => {
        // providerName에서 정렬 번호 제거 (형식: "번호|이름" 또는 "이름")
        const originalName = providerName.includes('|')
          ? providerName.split('|').slice(1).join('|').trim()
          : providerName.trim();
        
        const lists = payload.partners as Required<typeof payload.partners>;
        const pick = (
          items: Array<{ name?: string; file?: Array<{ file?: unknown }> }>
        ): File | null => {
          const partner = (items || []).find(
            p => (p.name || '').trim() === originalName
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
        return pick(lists.sponsors || []) ?? null;
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