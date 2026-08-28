'use client';

import { useMemo } from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  extractEventStatus,
  fetchPublicEventDetail,
  fetchPublicMainPageImages,
  fetchPublicPaymentInfo,
  type PublicEventDetailResponse,
  type PublicMainPageImagesResponse,
} from '@/services/publicEventAssets';

/** 신청 구간: 마감·결제 정보를 조금 더 자주 갱신 */
export const REGISTRATION_EVENT_STALE_TIME = 30 * 1000;

export const publicEventQueryKeys = {
  mainPageImages: (eventId: string) =>
    ['publicEvent', eventId, 'mainpage-images'] as const,
  detail: (eventId: string) => ['publicEvent', eventId, 'detail'] as const,
  paymentInfo: (eventId: string) =>
    ['publicEvent', eventId, 'payment-info'] as const,
};

type QueryOpts<T> = Omit<
  UseQueryOptions<T, Error, T, readonly string[]>,
  'queryKey' | 'queryFn'
>;

export function usePublicMainPageImages(
  eventId: string,
  options?: QueryOpts<PublicMainPageImagesResponse | null>
) {
  return useQuery({
    queryKey: publicEventQueryKeys.mainPageImages(eventId),
    queryFn: () => fetchPublicMainPageImages(eventId),
    enabled: Boolean(eventId),
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function usePublicEventDetail(
  eventId: string,
  options?: QueryOpts<PublicEventDetailResponse | null>
) {
  return useQuery({
    queryKey: publicEventQueryKeys.detail(eventId),
    queryFn: () => fetchPublicEventDetail(eventId),
    enabled: Boolean(eventId),
    staleTime: REGISTRATION_EVENT_STALE_TIME,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function usePublicEventStatus(eventId: string) {
  const query = usePublicEventDetail(eventId);
  const eventStatus = useMemo(
    () => extractEventStatus(query.data),
    [query.data]
  );
  return { ...query, eventStatus };
}

const DEFAULT_AGREEMENT = {
  eventName: '청주마라톤',
  organizationName: '청주마라톤 조직위원회',
};

export function useAgreementData(eventId: string) {
  const { data } = usePublicMainPageImages(eventId);

  return useMemo(() => {
    if (data?.nameKr) {
      return {
        eventName: data.nameKr,
        organizationName: `${data.nameKr} 조직위원회`,
      };
    }

    if (typeof window !== 'undefined' && eventId) {
      const preloaded = (
        window as Window & {
          __KMA_EVENT_INFO__?: Record<string, { nameKr?: string }>;
        }
      ).__KMA_EVENT_INFO__?.[eventId];
      if (preloaded?.nameKr) {
        return {
          eventName: preloaded.nameKr,
          organizationName: `${preloaded.nameKr} 조직위원회`,
        };
      }
    }

    return DEFAULT_AGREEMENT;
  }, [data, eventId]);
}

export type EventPaymentDisplayInfo = {
  bankName: string;
  virtualAccount: string;
  accountHolderName: string;
};

type PaymentPrefer = 'event' | 'payment-info';

/**
 * 결제 계좌 표시 — 개인: event 상세 우선, 단체: payment-info 우선 (기존 동작 유지)
 */
export function useEventPaymentDisplayInfo(
  eventId: string | undefined,
  options?: { prefer?: PaymentPrefer }
) {
  const prefer = options?.prefer ?? 'event';
  const enabled = Boolean(eventId);
  const id = eventId ?? '';

  const eventQuery = usePublicEventDetail(id, { enabled });
  const eventInfo = eventQuery.data?.eventInfo;
  const hasEventPayment = Boolean(eventInfo?.bank || eventInfo?.virtualAccount);

  const paymentInfoQuery = useQuery({
    queryKey: publicEventQueryKeys.paymentInfo(id),
    queryFn: () => fetchPublicPaymentInfo(id),
    enabled:
      enabled &&
      (prefer === 'payment-info' ||
        (eventQuery.isSuccess && !hasEventPayment)),
    staleTime: REGISTRATION_EVENT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const display = useMemo<EventPaymentDisplayInfo>(() => {
    const fromEvent: EventPaymentDisplayInfo = {
      bankName: String(eventInfo?.bank ?? ''),
      virtualAccount: String(eventInfo?.virtualAccount ?? ''),
      accountHolderName: String(eventInfo?.accountHolderName ?? ''),
    };

    const paymentData = paymentInfoQuery.data;
    const fromPayment: EventPaymentDisplayInfo = {
      bankName: String(paymentData?.bankName ?? ''),
      virtualAccount: String(paymentData?.virtualAccount ?? ''),
      accountHolderName: String(paymentData?.accountHolderName ?? ''),
    };

    const hasPaymentApiData = Boolean(
      fromPayment.bankName || fromPayment.virtualAccount
    );

    if (prefer === 'payment-info') {
      if (hasPaymentApiData) return fromPayment;
      return fromEvent;
    }

    if (hasEventPayment) return fromEvent;
    if (hasPaymentApiData) return fromPayment;
    return fromEvent;
  }, [eventInfo, hasEventPayment, paymentInfoQuery.data, prefer]);

  const isLoading =
    eventQuery.isLoading ||
    (prefer === 'payment-info'
      ? paymentInfoQuery.isLoading
      : eventQuery.isSuccess && !hasEventPayment && paymentInfoQuery.isLoading);

  return {
    ...display,
    isLoading,
    isError: eventQuery.isError && paymentInfoQuery.isError,
  };
}
