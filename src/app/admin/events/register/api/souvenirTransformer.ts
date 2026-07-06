// src/app/admin/events/register/api/souvenirTransformer.ts

import type { EventCreatePayload } from './types';
import type { SouvenirUpdateRequest } from './types';

type GiftInput = { id?: string; name: string; size: string; isActive?: boolean };

type ExistingSouvenir = { id: string; name: string; sizes: string };

function resolveExistingSouvenirId(
  gift: GiftInput,
  existingSouvenirs?: ExistingSouvenir[]
): string | undefined {
  if (gift.id) return gift.id;
  if (!existingSouvenirs?.length) return undefined;

  const trimmedName = gift.name.trim();
  const trimmedSize = (gift.size || '').trim();

  const byNameAndSize = existingSouvenirs.find(
    s => s.name === trimmedName && s.sizes === trimmedSize
  );
  if (byNameAndSize) return byNameAndSize.id;

  const byNameOnly = existingSouvenirs.filter(s => s.name === trimmedName);
  if (byNameOnly.length === 1) return byNameOnly[0].id;

  return undefined;
}

/**
 * 기념품 데이터를 API 요청 형식으로 변환
 * @param payload 프론트엔드 폼 데이터
 * @param existingSouvenirs 기존 기념품 목록 (수정 시 ID 매핑용)
 * @param gifts 직접 전달된 기념품 배열 (선택적, groups 대신 사용)
 */
export function transformSouvenirsToApi(
  payload: EventCreatePayload,
  existingSouvenirs?: ExistingSouvenir[],
  gifts?: GiftInput[]
): SouvenirUpdateRequest[] {
  const allGifts = new Map<string, GiftInput>();

  if (gifts && gifts.length > 0) {
    gifts.forEach((gift, index) => {
      if (!gift.name?.trim()) return;
      const key = gift.id ?? `row_${index}_${gift.name.trim()}_${(gift.size || '').trim()}`;
      allGifts.set(key, {
        id: gift.id,
        name: gift.name.trim(),
        size: (gift.size || '').trim(),
        isActive: gift.isActive,
      });
    });
  } else if (payload.groups) {
    payload.groups.forEach(group => {
      if (group.gifts) {
        group.gifts.forEach(gift => {
          if (!gift.label?.trim()) return;
          const key = `${gift.label.trim()}_${(gift.size || '').trim()}`;
          if (!allGifts.has(key)) {
            allGifts.set(key, {
              name: gift.label.trim(),
              size: (gift.size || '').trim(),
            });
          }
        });
      }
    });
  }

  const result: SouvenirUpdateRequest[] = Array.from(allGifts.values()).map(gift => {
    const existingId = resolveExistingSouvenirId(gift, existingSouvenirs);

    return {
      id: existingId,
      name: gift.name,
      sizes: gift.size,
      isActive: gift.isActive !== false,
    };
  });

  return result;
}
