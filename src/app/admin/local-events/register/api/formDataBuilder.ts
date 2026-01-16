// app/admin/local-events/register/api/formDataBuilder.ts
/**
 * 지역대회 FormData 빌더
 */

import type { LocalEventCreateRequest } from './types';

export class FormDataBuilder {
  /**
   * 지역대회 생성 요청을 위한 FormData 생성
   */
  static buildLocalEventCreateFormData(
    localEventCreateRequest: LocalEventCreateRequest,
    promotionBanner?: File
  ): FormData {
    const formData = new FormData();

    // 1. JSON 데이터 추가
    formData.append(
      'localEventCreateRequest',
      JSON.stringify(localEventCreateRequest)
    );

    // 2. 홍보 배너 이미지 추가 (선택사항)
    if (promotionBanner) {
      formData.append('promotionBanner', promotionBanner);
    }

    return formData;
  }
}

