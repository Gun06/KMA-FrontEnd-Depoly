import { useGetQuery } from '@/hooks/useFetch';

export type CashReceiptDashboardStatus = 'REQUESTED' | 'COMPLETED' | 'CANCELED';

export interface CashReceiptRequestedItem {
  no: number;
  id: string;
  eventId: string;
  eventName: string;
  requesterName: string;
  status: CashReceiptDashboardStatus;
}

export interface CashReceiptStatisticsResponse {
  totalCount: number;
  requestedCount: number;
  processedPercent: number;
  latestRequestedList: CashReceiptRequestedItem[];
}

export function useCashReceiptStatistics() {
  return useGetQuery<CashReceiptStatisticsResponse>(
    ['admin', 'cash-receipt', 'statistics'],
    '/api/v1/cash-receipt/statistics',
    'admin',
    {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    },
    true
  );
}
