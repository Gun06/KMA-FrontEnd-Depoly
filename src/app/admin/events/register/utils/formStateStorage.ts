// src/app/admin/events/register/utils/formStateStorage.ts
'use client';

import type { EventCreatePayload } from '../api/types';

const STORAGE_KEY = 'kma_event_registration_draft';

/**
 * 폼 상태를 localStorage에 저장하는 유틸리티
 */
export class FormStateStorage {
  /**
   * 폼 상태를 localStorage에 저장
   * File 객체는 저장할 수 없으므로 제외
   */
  static save(payload: EventCreatePayload): void {
    try {
      // File 객체가 포함된 uploads는 제외하고 저장
      const { uploads, ...saveablePayload } = payload;
      
      const serialized = JSON.stringify(saveablePayload);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      // localStorage가 가득 찼거나 비활성화된 경우 무시
    }
  }

  /**
   * localStorage에서 폼 상태를 복원
   */
  static load(): Partial<EventCreatePayload> | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return null;

      const payload = JSON.parse(serialized) as Partial<EventCreatePayload>;
      return payload;
    } catch (error) {
      // 잘못된 데이터인 경우 삭제
      this.clear();
      return null;
    }
  }

  /**
   * 저장된 폼 상태 삭제 (성공적으로 저장된 후 호출)
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // 무시
    }
  }

  /**
   * 저장된 폼 상태가 있는지 확인
   */
  static hasSavedState(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }
}

