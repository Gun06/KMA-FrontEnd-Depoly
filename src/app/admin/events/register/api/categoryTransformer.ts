// src/app/admin/events/register/api/categoryTransformer.ts

import type { EventCreatePayload } from './types';
import type { EventCategoryUpdateRequest } from './types';

type GiftInput = { id?: string; name: string; size: string };

function buildSouvenirIdMap(
  existingSouvenirs?: Array<{ id: string; name: string; sizes: string }>
) {
  const souvenirIdByNameSize = new Map<string, string>();
  if (existingSouvenirs) {
    existingSouvenirs.forEach(souvenir => {
      souvenirIdByNameSize.set(`${souvenir.name}_${souvenir.sizes}`, souvenir.id);
    });
  }
  return souvenirIdByNameSize;
}

function resolveSouvenirId(
  gift: GiftInput,
  souvenirIdByNameSize: Map<string, string>
): string | undefined {
  if (gift.id) return gift.id;
  return souvenirIdByNameSize.get(`${gift.name}_${gift.size}`);
}

/**
 * 종목 데이터를 API 요청 형식으로 변환
 * @param payload 프론트엔드 폼 데이터
 * @param existingCategories 기존 종목 목록 (수정 시 ID 매핑용)
 * @param existingSouvenirs 기존 기념품 목록 (기념품 ID 매핑용)
 * @param courses 직접 전달된 종목 배열 (선택적, groups 대신 사용)
 * @param gifts 직접 전달된 기념품 배열 (선택적, courses의 selectedGifts와 매핑용)
 */
export function transformCategoriesToApi(
  payload: EventCreatePayload,
  existingCategories?: Array<{
    id: string;
    name: string;
    amount?: number;
    price?: number;
    souvenirs: Array<{
      id: string;
      name: string;
      sizes: string;
      eventCategoryId?: string;
    }>;
  }>,
  existingSouvenirs?: Array<{
    id: string;
    name: string;
    sizes: string;
  }>,
  courses?: Array<{ name: string; price: string; selectedGifts: number[]; isActive?: boolean }>,
  gifts?: GiftInput[]
): EventCategoryUpdateRequest[] {
  if (courses && courses.length > 0 && gifts) {
    const categoryIdMap = new Map<string, string>();
    if (existingCategories) {
      existingCategories.forEach(category => {
        categoryIdMap.set(category.name, category.id);
      });
    }

    const souvenirIdByNameSize = buildSouvenirIdMap(existingSouvenirs);

    const result: EventCategoryUpdateRequest[] = courses
      .filter(course => course.name?.trim())
      .map(course => {
        const courseName = course.name.trim();
        const price = typeof course.price === 'string'
          ? Number(course.price.replace(/,/g, ''))
          : typeof course.price === 'number'
          ? course.price
          : 0;

        const existingCategoryId = categoryIdMap.get(courseName);

        const souvenirIds: string[] = course.selectedGifts
          .filter(giftIndex => giftIndex >= 0 && giftIndex < gifts.length)
          .map(giftIndex => resolveSouvenirId(gifts[giftIndex], souvenirIdByNameSize))
          .filter((id): id is string => !!id);

        return {
          id: existingCategoryId,
          name: courseName,
          price: Number.isFinite(price) ? price : 0,
          isActive: course.isActive !== false,
          souvenirIds,
        };
      });

    return result;
  }

  if (!payload.groups || payload.groups.length === 0) {
    return [];
  }

  const categoryIdMap = new Map<string, string>();
  if (existingCategories) {
    existingCategories.forEach(category => {
      categoryIdMap.set(category.name, category.id);
    });
  }

  const souvenirIdByNameSize = buildSouvenirIdMap(existingSouvenirs);

  const result: EventCategoryUpdateRequest[] = payload.groups
    .filter(group => group.course?.name?.trim())
    .map(group => {
      const courseName = group.course.name.trim();
      const price = typeof group.course.price === 'number'
        ? group.course.price
        : Number(group.course.price);

      const existingCategoryId = categoryIdMap.get(courseName);

      const souvenirIds: string[] = (group.gifts || [])
        .filter(gift => gift.label?.trim())
        .map(gift => {
          const key = `${gift.label.trim()}_${(gift.size || '').trim()}`;
          return souvenirIdByNameSize.get(key);
        })
        .filter((id): id is string => !!id);

      return {
        id: existingCategoryId,
        name: courseName,
        price: Number.isFinite(price) ? price : 0,
        isActive: group.course.isActive !== false,
        souvenirIds,
      };
    });

  return result;
}
