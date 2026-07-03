'use client';

import React from 'react';
import type { CashReceiptBatch } from './types/cashReceiptAdmin';

type BatchAction = 'complete' | 'cancel';

type Props = {
  batches: CashReceiptBatch[];
  isLoading: boolean;
  processingBatchId: string | null;
  processingAction: BatchAction | null;
  onComplete: (batchId: string, totalCount: number) => void;
  onCancel: (batchId: string, totalCount: number) => void;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateRange(oldest: string, latest: string): string {
  return `${formatDateTime(oldest)} ~ ${formatDateTime(latest)}`;
}

export default function CashReceiptBatchList({
  batches,
  isLoading,
  processingBatchId,
  processingAction,
  onComplete,
  onCancel,
}: Props) {
  const isProcessing = (batchId: string, action: BatchAction) =>
    processingBatchId === batchId && processingAction === action;

  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50/60">
      <div className="border-b border-gray-200 px-4 py-3">
        <h4 className="text-sm font-semibold text-gray-900">영수증 처리 대기 큐</h4>
        <p className="mt-0.5 text-xs text-gray-500">
          다운로드 버튼을 누르면 처리 대기 건이 엑셀로 내려받아지고, 영수증 처리 대기 큐에 추가됩니다.
          토스에서 실제 발급을 마친 뒤 발급 완료 버튼을 눌러주세요. 잘못 다운로드한 경우 되돌리기 버튼을 사용할 수 있습니다.
        </p>
      </div>

      {isLoading ? (
        <div className="px-4 py-6 text-center text-sm text-gray-500">영수증 처리 대기 큐를 불러오는 중입니다.</div>
      ) : batches.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">영수증 처리 대기 큐가 비어 있습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {batches.map((batch) => {
            const completing = isProcessing(batch.batchId, 'complete');
            const canceling = isProcessing(batch.batchId, 'cancel');
            const disabled = processingBatchId !== null;

            return (
              <li
                key={batch.batchId}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDateTime(batch.createdAt)} 다운로드
                    </span>
                    <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-[#E6A400]">
                      발급 대기
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    총 <span className="font-semibold text-gray-900">{batch.totalCount.toLocaleString()}</span>건
                    <span className="mx-2 text-gray-300">|</span>
                    신청 기간 {formatDateRange(batch.oldestRequestedAt, batch.latestRequestedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                    onClick={() => onComplete(batch.batchId, batch.totalCount)}
                  >
                    {completing ? '처리 중...' : '발급 완료'}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled}
                    onClick={() => onCancel(batch.batchId, batch.totalCount)}
                  >
                    {canceling ? '처리 중...' : '되돌리기'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
