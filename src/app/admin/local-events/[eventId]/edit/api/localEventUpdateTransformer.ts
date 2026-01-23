// app/admin/local-events/[eventId]/edit/api/localEventUpdateTransformer.ts
/**
 * 지역대회 수정 데이터 변환 유틸리티
 */

import type { LocalEventUpdatePayload, LocalEventUpdateRequest } from './types';

export class LocalEventUpdateTransformer {
  /**
   * 클라이언트 페이로드를 서버 요청 형식으로 변환
   */
  static transformToServerFormat(
    payload: LocalEventUpdatePayload
  ): {
    localEventUpdateRequest: LocalEventUpdateRequest;
    promotionBanner?: File;
  } {
    const localEventUpdateRequest: LocalEventUpdateRequest = {
      eventName: payload.eventName,
      eventUrl: payload.eventUrl,
      eventStatus: payload.eventStatus,
      eventStartDate: payload.eventStartDate,
      registStartDate: payload.registStartDate,
      registDeadline: payload.registDeadline,
      visibleStatus: payload.visibleStatus,
      eventCategoryCsv: payload.eventCategoryCsv,
      // 기존 이미지 URL이 있고 새 파일이 없으면 기존 URL 유지
      promotionBanner: payload.promotionBanner 
        ? undefined 
        : payload.existingPromotionBanner,
    };

    return {
      localEventUpdateRequest,
      promotionBanner: payload.promotionBanner,
    };
  }

  /**
   * 이미지 유효성 검증 (홍보 배너는 선택사항)
   */
  static validateImages(_promotionBanner?: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    // 홍보 배너는 선택사항이므로 검증하지 않음
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

