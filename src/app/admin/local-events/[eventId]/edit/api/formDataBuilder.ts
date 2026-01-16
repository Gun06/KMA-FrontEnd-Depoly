// app/admin/local-events/[eventId]/edit/api/formDataBuilder.ts
/**
 * 지역대회 수정 FormData 빌더
 */

import type { LocalEventUpdateRequest } from './types';

export class FormDataBuilder {
  /**
   * 지역대회 수정 요청을 위한 FormData 생성
   */
  static buildLocalEventUpdateFormData(
    localEventUpdateRequest: LocalEventUpdateRequest,
    promotionBanner?: File
  ): FormData {
    const formData = new FormData();

    // 1. JSON 데이터 추가
    formData.append(
      'localEventUpdateRequest',
      JSON.stringify(localEventUpdateRequest)
    );

    // 2. 홍보 배너 이미지 추가 (선택사항, 새로 업로드하는 경우만)
    if (promotionBanner) {
      formData.append('promotionBanner', promotionBanner);
    }

    return formData;
  }
}

