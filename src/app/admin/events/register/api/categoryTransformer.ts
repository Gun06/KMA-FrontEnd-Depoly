// src/app/admin/events/register/api/categoryTransformer.ts

import type { EventCreatePayload } from './types';
import type { EventCategoryUpdateRequest, SouvenirUpdateRequest } from './types';

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
    amount?: number; // API에서는 amount로 오지만 price로도 사용 가능
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
  gifts?: Array<{ name: string; size: string }>
): EventCategoryUpdateRequest[] {
  // courses 배열이 직접 전달된 경우 우선 사용
  if (courses && courses.length > 0 && gifts) {
    // 기존 종목 ID 매핑 생성 (name으로 매칭)
    const categoryIdMap = new Map<string, string>();
    if (existingCategories) {
      existingCategories.forEach(category => {
        categoryIdMap.set(category.name, category.id);
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

    // 종목 데이터 변환
    const result: EventCategoryUpdateRequest[] = courses
      .filter(course => course.name?.trim())
      .map(course => {
        const courseName = course.name.trim();
        const price = typeof course.price === 'string'
          ? Number(course.price.replace(/,/g, ''))
          : typeof course.price === 'number'
          ? course.price
          : 0;

        // 기존 종목 ID 찾기
        const existingCategoryId = categoryIdMap.get(courseName);

        // 기념품 ID 배열 생성 (selectedGifts 인덱스를 사용)
        const souvenirIds: string[] = course.selectedGifts
          .filter(giftIndex => giftIndex >= 0 && giftIndex < gifts.length)
          .map(giftIndex => {
            const gift = gifts[giftIndex];
            const key = `${gift.name}_${gift.size}`;
            return souvenirIdMap.get(key);
          })
          .filter((id): id is string => !!id); // undefined 제거

        return {
          id: existingCategoryId, // 있으면 수정, 없으면 생성
          name: courseName,
          price: Number.isFinite(price) ? price : 0,
          isActive: course.isActive !== false, // enabled가 false가 아니면 true (기본값 true)
          souvenirIds,
        };
      })
      .filter(category => category.price > 0); // 가격이 0보다 큰 것만

    return result;
  }

  // 기존 로직 (payload.groups 사용)
  if (!payload.groups || payload.groups.length === 0) {
    return [];
  }

  // 기존 종목 ID 매핑 생성 (name으로 매칭)
  const categoryIdMap = new Map<string, string>();
  if (existingCategories) {
    existingCategories.forEach(category => {
      categoryIdMap.set(category.name, category.id);
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

  // 종목 데이터 변환
  const result: EventCategoryUpdateRequest[] = payload.groups
    .filter(group => group.course?.name?.trim())
    .map(group => {
      const courseName = group.course.name.trim();
      const price = typeof group.course.price === 'number'
        ? group.course.price
        : Number(group.course.price);

      // 기존 종목 ID 찾기
      const existingCategoryId = categoryIdMap.get(courseName);

      // 기념품 ID 배열 생성
      const souvenirIds: string[] = (group.gifts || [])
        .filter(gift => gift.label?.trim())
        .map(gift => {
          const key = `${gift.label.trim()}_${(gift.size || '').trim()}`;
          const souvenirId = souvenirIdMap.get(key);
          return souvenirId;
        })
        .filter((id): id is string => !!id); // undefined 제거

      return {
        id: existingCategoryId, // 있으면 수정, 없으면 생성
        name: courseName,
        price: Number.isFinite(price) ? price : 0,
        isActive: group.course.isActive !== false, // enabled가 false가 아니면 true (기본값 true)
        souvenirIds,
      };
    })
    .filter(category => category.price > 0); // 가격이 0보다 큰 것만

  return result;
}
