// src/app/admin/events/register/hooks/useFormStatePersistence.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FormStateStorage } from '../utils/formStateStorage';
import type { EventCreatePayload } from '../api/types';

interface UseFormStatePersistenceOptions {
  /**
   * 폼 상태를 가져오는 함수
   */
  getFormState: () => EventCreatePayload;
  
  /**
   * 폼 상태를 복원하는 함수
   */
  restoreFormState: (payload: Partial<EventCreatePayload>) => void;
  
  /**
   * 자동 저장 간격 (밀리초, 기본값: 2000ms)
   */
  saveInterval?: number;
  
  /**
   * 저장된 상태를 복원할지 여부 (기본값: true)
   */
  shouldRestore?: boolean;
}

/**
 * 폼 상태를 자동으로 저장하고 복원하는 hook
 */
export function useFormStatePersistence({
  getFormState,
  restoreFormState,
  saveInterval = 2000,
  shouldRestore = true,
}: UseFormStatePersistenceOptions) {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoredRef = useRef(false);

  /**
   * 폼 상태 저장
   */
  const saveState = useCallback(() => {
    const state = getFormState();
    FormStateStorage.save(state);
  }, [getFormState]);

  /**
   * 저장된 폼 상태 복원
   */
  const restoreState = useCallback(() => {
    if (isRestoredRef.current) return;
    
    const savedState = FormStateStorage.load();
    if (savedState) {
      restoreFormState(savedState);
      isRestoredRef.current = true;
    }
  }, [restoreFormState]);

  /**
   * 강제로 상태 복원 (에러 발생 후에도 복원 가능하도록)
   */
  const forceRestore = useCallback(() => {
    // 복원 플래그를 리셋하여 다시 복원 가능하도록 함
    isRestoredRef.current = false;
    // 약간의 지연을 두어 상태 업데이트가 완료된 후 복원
    setTimeout(() => {
      restoreState();
    }, 0);
  }, [restoreState]);

  /**
   * 저장된 상태 삭제 (성공적으로 저장된 후 호출)
   */
  const clearSavedState = useCallback(() => {
    FormStateStorage.clear();
    isRestoredRef.current = false;
  }, []);

  // 초기 복원 (한 번만)
  useEffect(() => {
    if (shouldRestore && !isRestoredRef.current) {
      restoreState();
    }
  }, [shouldRestore, restoreState]);

  // 주기적으로 자동 저장
  useEffect(() => {
    if (saveInterval > 0) {
      saveTimerRef.current = setInterval(() => {
        saveState();
      }, saveInterval);

      return () => {
        if (saveTimerRef.current) {
          clearInterval(saveTimerRef.current);
          saveTimerRef.current = null;
        }
      };
    }
  }, [saveInterval, saveState]);

  // 컴포넌트 언마운트 시 마지막 저장
  useEffect(() => {
    return () => {
      saveState();
    };
  }, [saveState]);

  return {
    saveState,
    restoreState,
    forceRestore,
    clearSavedState,
  };
}

