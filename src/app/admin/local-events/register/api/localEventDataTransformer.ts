// app/admin/local-events/register/api/localEventDataTransformer.ts
/**
 * 지역대회 데이터 변환 유틸리티
 */

import type { LocalEventCreatePayload, LocalEventCreateRequest } from './types';

export class LocalEventDataTransformer {
  /**
   * 클라이언트 페이로드를 서버 요청 형식으로 변환
   */
  static transformToServerFormat(
    payload: LocalEventCreatePayload
  ): {
    localEventCreateRequest: LocalEventCreateRequest;
    promotionBanner?: File;
  } {
    const localEventCreateRequest: LocalEventCreateRequest = {
      eventName: payload.eventName,
      eventUrl: payload.eventUrl,
      eventStatus: payload.eventStatus,
      eventStartDate: payload.eventStartDate,
      registStartDate: payload.registStartDate,
      registDeadline: payload.registDeadline,
      visibleStatus: payload.visibleStatus,
      lowestAmount: payload.lowestAmount,
    };

    return {
      localEventCreateRequest,
      promotionBanner: payload.promotionBanner,
    };
  }

  /**
   * 이미지 유효성 검증 (홍보 배너는 선택사항이므로 항상 유효)
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

