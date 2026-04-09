import { useQuery } from '@tanstack/react-query';
import { searchCashReceiptList } from '../services/cashReceiptAdmin';
import type { CashReceiptSearchParams } from '../types/cashReceiptAdmin';

export function useCashReceiptSearch(params: CashReceiptSearchParams) {
  return useQuery({
    queryKey: [
      'cashReceiptSearch',
      params.eventId,
      params.status,
      params.keyword,
      params.sort,
      params.page,
      params.size,
    ],
    queryFn: () => searchCashReceiptList(params),
    staleTime: 0,
    placeholderData: (previousData) => previousData,
  });
}
