'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { HttpError } from '@/hooks/useFetch';

interface QueryProviderProps {
  children: ReactNode;
}

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
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown, query) => {
            const message = (() => {
              if (error instanceof HttpError) return error.message;
              if (error instanceof Error) return error.message;
              return '요청 중 오류가 발생했습니다.';
            })();
            
            // 삭제된 이벤트 관련 에러는 무시 (404 또는 "이미 삭제되었거나 존재하지 않는" 메시지)
            const isDeletedEventError = 
              (error instanceof HttpError && error.status === 404) ||
              message.includes('이미 삭제되었거나 존재하지 않는') ||
              message.includes('존재하지 않는 대회');
            
            // 지역대회 상세 조회 에러는 무시 (삭제 후 발생할 수 있음)
            const isLocalEventDetailError = 
              Array.isArray(query?.queryKey) &&
              query.queryKey[0] === 'admin' &&
              query.queryKey[1] === 'local-events' &&
              query.queryKey[2] === 'detail';
            
            if (!isDeletedEventError && !isLocalEventDetailError) {
              toast.error(message);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const message = (() => {
              if (error instanceof HttpError) return error.message;
              if (error instanceof Error) return error.message;
              return '요청 중 오류가 발생했습니다.';
            })();
            
            // 삭제된 이벤트 관련 에러는 무시
            const isDeletedEventError = 
              (error instanceof HttpError && error.status === 404) ||
              message.includes('이미 삭제되었거나 존재하지 않는') ||
              message.includes('존재하지 않는 대회');
            
            if (!isDeletedEventError) {
              toast.error(message);
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
