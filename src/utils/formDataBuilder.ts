// src/utils/formDataBuilder.ts

import type { EventCreateRequest, EventImageFiles } from "@/types/Admin";

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
    formData.append("eventCreateRequest", JSON.stringify(eventCreateRequest));
    
    // 2. 필수 이미지 파일들 추가
    this.appendRequiredImages(formData, imageFiles);
    
    // 3. 주최/주관/후원 배너 이미지들 추가 (순서 중요!)
    this.appendBannerImages(formData, imageFiles);
    
    return formData;
  }
  
  /**
   * 필수 이미지 파일들을 FormData에 추가
   */
  private static appendRequiredImages(formData: FormData, imageFiles: EventImageFiles): void {
    // 공용: 크로스-리얼름 File/Blob도 수용하여 안전하게 append
    const toBlobAndName = (maybeFile: unknown, fallbackName: string): { blob: Blob; name: string } => {
      if (maybeFile && typeof maybeFile === 'object') {
        const anyFile = maybeFile as { name?: unknown; size?: unknown; type?: unknown; slice?: unknown };
        const hasBlobShape = typeof anyFile.size === 'number' && typeof (anyFile as Blob).slice === 'function';
        const name = typeof anyFile.name === 'string' ? anyFile.name : fallbackName;
        if (hasBlobShape) {
          return { blob: anyFile as unknown as Blob, name };
        }
      }
      // fallback: 0-byte PNG placeholder
      return { blob: new Blob([""], { type: "image/png" }), name: fallbackName };
    };

    // 1) 상단 배너 4종은 키가 반드시 포함되도록 보장 (없으면 placeholder)
    type BannerKey = "mainBannerPcImage" | "mainBannerMobileImage" | "mainOutlinePcImage" | "mainOutlineMobileImage";

    const bannerPairs: Array<{ key: BannerKey; formKey: string; fallback: string }> = [
      { key: "mainBannerPcImage", formKey: "mainBannerPcImage", fallback: "mainBannerPcImage.png" },
      { key: "mainBannerMobileImage", formKey: "mainBannerMobileImage", fallback: "mainBannerMobileImage.png" },
      { key: "mainOutlinePcImage", formKey: "mainOutlinePcImage", fallback: "mainOutlinePcImage.png" },
      { key: "mainOutlineMobileImage", formKey: "mainOutlineMobileImage", fallback: "mainOutlineMobileImage.png" },
    ];

    for (const { key, formKey, fallback } of bannerPairs) {
      // 키를 반드시 포함 — 서버 측에서 키 존재 여부로 분기할 수 있게 함
      const { blob, name } = toBlobAndName(imageFiles[key] as unknown, fallback);
      formData.append(formKey, blob, name);
    }

    // 2) 나머지 필수/선택 이미지들 — 존재 시 추가
    const otherImages = [
      { key: "eventOutlineImage", file: imageFiles.eventOutlineImage },
      { key: "promotionBannerImage", file: imageFiles.promotionBannerImage },
      { key: "souvenirImage", file: imageFiles.souvenirImage },
      { key: "noticeImage", file: imageFiles.noticeImage },
      { key: "meetingPlaceImage", file: imageFiles.meetingPlaceImage },
      { key: "resultImage", file: imageFiles.resultImage },
      { key: "courseImage", file: imageFiles.courseImage },
    ];

    for (const { key, file } of otherImages) {
      if (file) {
        const { blob, name } = toBlobAndName(file as unknown, `${String(key)}.png`);
        formData.append(key, blob, name);
      }
    }
  }
  
  /**
   * 주최/주관/후원 배너 이미지들을 FormData에 추가
   * eventBannerInfoList와 동일한 순서로 추가해야 함
   */
  private static appendBannerImages(formData: FormData, imageFiles: EventImageFiles): void {
    if (imageFiles.eventBannerImages && imageFiles.eventBannerImages.length > 0) {
      for (let i = 0; i < imageFiles.eventBannerImages.length; i++) {
        const bannerImage = imageFiles.eventBannerImages[i];
        formData.append("eventBannerImages", bannerImage);
      }
    } else {
      // no-op
    }
  }
  
  /**
   * FormData 내용을 콘솔에 출력 (디버깅용)
   */
  static logFormData(formData: FormData): void {
    console.log(formData);
    // intentionally noop in production builds
  }
}
