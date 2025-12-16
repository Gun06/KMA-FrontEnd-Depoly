// src/app/admin/events/register/api/souvenirTransformer.ts

import type { EventCreatePayload } from './types';
import type { SouvenirUpdateRequest } from './types';

/**
 * 기념품 데이터를 API 요청 형식으로 변환
 * @param payload 프론트엔드 폼 데이터
 * @param existingSouvenirs 기존 기념품 목록 (수정 시 ID 매핑용)
 * @param gifts 직접 전달된 기념품 배열 (선택적, groups 대신 사용)
 */
export function transformSouvenirsToApi(
  payload: EventCreatePayload,
  existingSouvenirs?: Array<{
    id: string;
    name: string;
    sizes: string;
  }>,
  gifts?: Array<{ name: string; size: string }>
): SouvenirUpdateRequest[] {
  // 모든 기념품 수집
  const allGifts = new Map<string, { name: string; size: string }>();

  // gifts 배열이 직접 전달된 경우 우선 사용
  if (gifts && gifts.length > 0) {
    gifts.forEach(gift => {
      const key = `${gift.name}_${gift.size}`;
      if (!allGifts.has(key) && gift.name?.trim()) {
        allGifts.set(key, {
          name: gift.name.trim(),
          size: (gift.size || '').trim(),
        });
      }
    });
  } else if (payload.groups) {
    // groups에서 기념품 추출
    payload.groups.forEach(group => {
      if (group.gifts) {
        group.gifts.forEach(gift => {
          const key = `${gift.label}_${gift.size}`;
          if (!allGifts.has(key) && gift.label?.trim()) {
            allGifts.set(key, {
              name: gift.label.trim(),
              size: (gift.size || '').trim(),
            });
          }
        });
      }
    });
  }

  // 기존 기념품 ID 매핑 생성 (name + sizes로 매칭)
  const souvenirIdMap = new Map<string, string>();
  if (existingSouvenirs) {
    existingSouvenirs.forEach(souvenir => {
      const key = `${souvenir.name}_${souvenir.sizes}`;
      souvenirIdMap.set(key, souvenir.id);
    });
  }

  // API 요청 형식으로 변환
  const result: SouvenirUpdateRequest[] = Array.from(allGifts.values()).map(gift => {
    const key = `${gift.name}_${gift.size}`;
    const existingId = souvenirIdMap.get(key);

    return {
      id: existingId, // 있으면 수정, 없으면 생성
      name: gift.name,
      sizes: gift.size,
    };
  });

  return result;
}
