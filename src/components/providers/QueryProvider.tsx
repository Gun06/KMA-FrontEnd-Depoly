'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { HttpError } from '@/hooks/useFetch';
import { showGlobalQueryErrorToast } from '@/utils/globalQueryErrorToast';

interface QueryProviderProps {
  children: ReactNode;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) return error.message;
  if (error instanceof Error) return error.message;
  return '';
};

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 10 * 60 * 1000, // 10분
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            // POST 등 부수효과 요청은 기본적으로 재시도하지 않음.
            // (회원가입처럼 멱등하지 않은 API는 재시도 시 중복 가입·토큰 소진 등이 발생할 수 있음)
            // 네트워크 오류 재시도가 필요한 mutation은 개별 retry 옵션으로 지정.
            retry: 0,
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown, query) => {
            const message = getErrorMessage(error);

            // 삭제된 이벤트 관련 에러는 무시 (404 또는 "이미 삭제되었거나 존재하지 않는" 메시지)
            const isDeletedEventError =
              (error instanceof HttpError &&
                (error.status === 404 ||
                  error.code === 'NOT_FOUND_EVENT' ||
                  error.serverHttpStatus === 'NOT_FOUND')) ||
              message.includes('이미 삭제되었거나 존재하지 않는') ||
              message.includes('존재하지 않는 대회') ||
              message.includes('대회를 찾을 수 없습니다');

            // 지역대회 상세 조회 에러는 무시 (삭제 후 재조회·확인 클릭 직전 404 등, 화면에서 처리)
            const isLocalEventDetailError =
              Array.isArray(query?.queryKey) &&
              ((query.queryKey[0] === 'admin' &&
                query.queryKey[1] === 'local-events' &&
                query.queryKey[2] === 'detail') ||
                (query.queryKey[0] === 'local-event' &&
                  query.queryKey[1] === 'detail'));

            // 비공개 대회 스폰서 배너 조회 실패 에러는 무시 (404는 정상적인 응답)
            const isEventSponsorBannerError =
              Array.isArray(query?.queryKey) &&
              query.queryKey[0] === 'eventSponsorBanners' &&
              ((error instanceof HttpError && error.status === 404) ||
                message.includes('이벤트 스폰서 배너 조회 실패'));

            if (!isDeletedEventError && !isLocalEventDetailError && !isEventSponsorBannerError) {
              showGlobalQueryErrorToast(error);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown, _vars, _ctx, mutation) => {
            const meta = mutation?.options?.meta as
              | { suppressGlobalMutationErrorToast?: boolean }
              | undefined;
            if (meta?.suppressGlobalMutationErrorToast) return;

            const message = getErrorMessage(error);

            // 삭제된 이벤트 관련 에러는 무시
            const isDeletedEventError =
              (error instanceof HttpError && error.status === 404) ||
              message.includes('이미 삭제되었거나 존재하지 않는') ||
              message.includes('존재하지 않는 대회');

            if (!isDeletedEventError) {
              showGlobalQueryErrorToast(error);
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
        toastStyle={{ zIndex: 2147483647 }}
        style={{ zIndex: 2147483647 }}
      />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
