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
          onError: (error: unknown) => {
            const message = (() => {
              if (error instanceof HttpError) return error.message;
              if (error instanceof Error) return error.message;
              return '요청 중 오류가 발생했습니다.';
            })();
            toast.error(message);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const message = (() => {
              if (error instanceof HttpError) return error.message;
              if (error instanceof Error) return error.message;
              return '요청 중 오류가 발생했습니다.';
            })();
            toast.error(message);
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
