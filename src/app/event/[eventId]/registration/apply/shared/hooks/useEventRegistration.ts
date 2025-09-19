// 이벤트 등록 관련 커스텀 훅
import { useState, useEffect } from 'react';
import { EventRegistrationInfo } from '../types/common';
import { fetchEventRegistrationInfo } from '../api/event';

export const useEventRegistration = (eventId: string) => {
  const [eventInfo, setEventInfo] = useState<EventRegistrationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchEventRegistrationInfo(eventId);
        setEventInfo(data);
      } catch (error) {
        setError('이벤트 등록 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventInfo();
  }, [eventId]);

  return {
    eventInfo,
    isLoading,
    error,
    refetch: () => {
      const loadEventInfo = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const data = await fetchEventRegistrationInfo(eventId);
          setEventInfo(data);
        } catch (error) {
          setError('이벤트 등록 정보를 불러올 수 없습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      loadEventInfo();
    }
  };
};
