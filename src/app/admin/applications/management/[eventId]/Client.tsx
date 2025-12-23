// src/app/admin/applications/management/[eventId]/Client.tsx
'use client';

import React from 'react';
import { useRegistrationList, useRegistrationSearch, useRegistrationDetail } from '@/hooks/useRegistration';
import { useEventList } from '@/hooks/useNotices';
import ApplicantsManageTable from '@/components/admin/applications/ApplicantsManageTable';
import RegistrationDetailDrawer from '@/components/admin/applications/RegistrationDetailDrawer';
import PaymentUploadModal from '@/components/admin/applications/PaymentUploadModal';
import { downloadRegistrationList } from '@/services/registration';
import { useQueryClient } from '@tanstack/react-query';
import { toast, type Id } from 'react-toastify';
import type {
  SortKey,
  PaidFilter,
  ApplicantManageRow
} from '@/types/registration';
import {
  convertRegistrationToManageRow,
  convertFiltersToApiParams
} from '@/types/registration';

type Props = {
  eventId: string;
  initialPage: number;
  pageSize: number;
};

export default function Client({
  eventId, initialPage, pageSize,
}: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState<number>(initialPage);

  const [query, setQuery] = React.useState<string>('');
  const [paidFilter, setPaidFilter] = React.useState<PaidFilter>('');
  const [sortKey, setSortKey] = React.useState<SortKey>('id');
  const [searchField, setSearchField] = React.useState<'name' | 'org' | 'birth' | 'tel' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all'>('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // 항상 검색 API 사용 (서버에서 정렬과 번호를 내려줌)
  const searchParams = React.useMemo(() => ({
    eventId,
    page,
    size: pageSize,
    ...convertFiltersToApiParams(sortKey, paidFilter, query, searchField),
  }), [eventId, page, pageSize, sortKey, paidFilter, query, searchField]);

  // 항상 검색 API만 사용
  const { data: registrationData, isLoading, error } = useRegistrationSearch(searchParams, searchField as any);

  // 대회 정보 조회 (제목용)
  const { data: eventListData } = useEventList(1, 100);
  const currentEvent = (eventListData as { content?: Array<{ id: string; nameKr?: string; nameEn?: string }> })?.content?.find((e) => e.id === eventId);

  // API 데이터를 테이블 형식으로 변환
  const data = React.useMemo(() => {
    if (!registrationData?.content) return [];
    
    // 변환 (서버에서 이미 검색과 정렬이 완료된 결과를 사용, no는 서버에서 내려주는 값 사용)
    return registrationData.content.map((item, index) => 
      convertRegistrationToManageRow(item, index)
    );
  }, [registrationData]);

  // 검색 필드에 따라 total 계산
  const total = React.useMemo(() => {
    if (!registrationData) return 0;

    // 서버에서 검색이 완료된 결과이므로 API에서 내려주는 전체 개수 사용
    return registrationData.totalElements ?? data.length;
  }, [registrationData, data.length]);

  const rows = data;

  // 상세 드로어 상태
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  
  // 입금내역 업로드 모달 상태
  const [isPaymentUploadModalOpen, setIsPaymentUploadModalOpen] = React.useState(false);
  
  // 기존 업로드 관련 상태 (호환성 유지)
  const [isUploadingPayments, setIsUploadingPayments] = React.useState(false);
  const [isUploadStatusVisible, setIsUploadStatusVisible] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadController, setUploadController] = React.useState<AbortController | null>(null);
  const uploadToastIdRef = React.useRef<Id | null>(null);
  const uploadStartRef = React.useRef<number | null>(null);
  const uploadSessionRef = React.useRef<symbol | null>(null);

  React.useEffect(() => {
    if (!isUploadingPayments) return;

    const start = uploadStartRef.current ?? performance.now();
    uploadStartRef.current = start;

    let frameId = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const minDuration = 3000;
      let progressRatio: number;
      if (elapsed <= minDuration) {
        progressRatio = (elapsed / minDuration) * 0.9;
      } else {
        const extra = elapsed - minDuration;
        progressRatio = 0.9 + Math.min(extra / 5000, 0.09);
      }
      const nextProgress = Math.min(progressRatio * 100, 99);
      setUploadProgress((prev) => (nextProgress > prev ? nextProgress : prev));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isUploadingPayments]);
  
  // 상세 API 호출
  const { data: detailData, isLoading: isLoadingDetail } = useRegistrationDetail(selectedId);
  
  // 상세 데이터 우선, 없으면 목록 데이터에서 찾기
  const selectedItem = React.useMemo(() => {
    if (detailData) return detailData;
    return registrationData?.content?.find?.((it: any) => it.id === selectedId) ?? null;
  }, [detailData, registrationData, selectedId]);

  const onToggleSelectAll = (checked: boolean, _idsOnPage: string[]) => {
    if (checked) setSelectedIds(data.map(a => a.id));
    else setSelectedIds([]);
  };
  const onToggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(x => x !== id)));
  };

  const reset = () => {
    setQuery('');
    setPaidFilter('');
    setSortKey('id');
    setSearchField('all');
    setPage(1);
    setSelectedIds([]);
  };

  // Excel 다운로드 처리
  const handleDownloadApplicants = async () => {
    try {
      await downloadRegistrationList(eventId);
      toast.success('Excel 다운로드가 완료되었습니다!');
    } catch (_error) {
      toast.error('다운로드에 실패했습니다.');
    }
  };

  // Excel 업로드 처리 (모달 열기)
  const handleUploadPayments = () => {
    setIsPaymentUploadModalOpen(true);
  };
  
  // 입금내역 업로드 성공 후 처리
  const handlePaymentUploadSuccess = async () => {
    // 데이터 새로고침
    await queryClient.invalidateQueries({ queryKey: ['registrationList', eventId] });
    await queryClient.invalidateQueries({ queryKey: ['registrationSearch', eventId] });
  };

  const handleCancelUploadPayments = () => {
    if (!uploadController) return;
    uploadController.abort();
    if (uploadToastIdRef.current !== null) {
      toast.update(uploadToastIdRef.current, {
        render: '업로드를 취소 요청했습니다...',
        type: 'info',
        isLoading: true,
        autoClose: false,
        closeOnClick: false,
      });
    }
  };

  // 단체 신청 양식 다운로드 처리
  const handleDownloadGroupForm = async () => {
    try {
      // TODO: 단체 신청 양식 다운로드 API 호출
      toast.info('단체 신청 양식 다운로드 기능은 준비 중입니다.');
    } catch (_error) {
      toast.error('다운로드에 실패했습니다.');
    }
  };

  // 단체 신청 양식 업로드 처리
  const handleUploadGroupForm = () => {
    // TODO: 단체 신청 양식 업로드 모달 열기
    toast.info('단체 신청 양식 업로드 기능은 준비 중입니다.');
  };

  // 툴바 액션 처리
  const handleToolbarAction = (action: 'downloadApplicants' | 'uploadPayments' | 'downloadGroupForm' | 'uploadGroupForm') => {
    if (action === 'downloadApplicants') {
      handleDownloadApplicants();
    } else if (action === 'uploadPayments') {
      handleUploadPayments();
    } else if (action === 'downloadGroupForm') {
      handleDownloadGroupForm();
    } else if (action === 'uploadGroupForm') {
      handleUploadGroupForm();
    }
  };

  /** ✅ 전역 편집 저장(다건) */
  const handleBulkUpdateRows = async (nextRows: ApplicantManageRow[]) => {
    try {
      // 수정할 데이터가 없으면 조기 반환
      if (nextRows.length === 0) {
        toast.warning('수정할 데이터가 없습니다.');
        return;
      }

      // ApplicantsManageTable에서 이미 API 호출을 완료했으므로
      // 여기서는 쿼리 캐시만 무효화하여 데이터 새로고침
      await queryClient.invalidateQueries({
        queryKey: ['registrationList', eventId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['registrationSearch', eventId],
      });
      
      toast.success('수정이 완료되었습니다!');
    } catch (_error) {
      toast.error('수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (error) {
    return <div className="p-6">에러가 발생했습니다: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <ApplicantsManageTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onSearch={(q) => { setQuery(q); setPage(1); }}
        onSearchFieldChange={(f) => { setSearchField(f as 'name' | 'org' | 'birth' | 'tel' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all'); setPage(1); }}
        onFilterPaidChange={(v) => { setPaidFilter(v); setPage(1); }}
        onSortKeyChange={(k) => { setSortKey(k); setPage(1); }}
        onResetFilters={reset}
        selectedIds={selectedIds}
        onToggleSelectOne={onToggleSelectOne}
        onToggleSelectAll={onToggleSelectAll}
        onToolbarAction={handleToolbarAction}
        initialSearchField={searchField}
        isUploadingPayments={isUploadingPayments}
        isUploadStatusVisible={isUploadStatusVisible}
        uploadProgress={uploadProgress}
        onCancelUploadPayments={handleCancelUploadPayments}
        /** ⬇️ 전역 수정 모드 저장 콜백(다건) */
        onBulkUpdateRows={handleBulkUpdateRows}

        // 행 클릭 -> 상세 드로어 열기
        onRowClick={(row) => { setSelectedId(row.id); setOpen(true); }}
      />

      {/* 상세 드로어 */}
      <RegistrationDetailDrawer
        open={open}
        item={selectedItem}
        isLoading={isLoadingDetail}
        eventId={eventId}
        onClose={() => {
          setOpen(false);
          setSelectedId(null);
        }}
        onEdit={() => {
          if (!selectedItem) return;
          // 신청 수정 페이지로 이동 (관리자용 수정 페이지가 있다면 해당 경로로, 없으면 알림 표시)
          toast.info('신청 수정 기능은 준비 중입니다.');
          // TODO: 관리자 신청 수정 페이지로 이동
          // router.push(`/admin/applications/management/${eventId}/edit/${selectedId}`);
        }}
        onSave={async () => {
          if (!selectedId) return;
          try {
            // 저장 후 목록 및 상세 새로고침
            await queryClient.invalidateQueries({ queryKey: ['registrationList', eventId] });
            await queryClient.invalidateQueries({ queryKey: ['registrationSearch', eventId] });
            await queryClient.invalidateQueries({ queryKey: ['registrationDetail', selectedId] });
            toast.success('신청 정보가 수정되었습니다.');
          } catch (_e) {
            toast.error('데이터 새로고침에 실패했습니다.');
          }
        }}
      />

      {/* 입금내역 업로드 모달 */}
      <PaymentUploadModal
        isOpen={isPaymentUploadModalOpen}
        onClose={() => setIsPaymentUploadModalOpen(false)}
        eventId={eventId}
        onSuccess={handlePaymentUploadSuccess}
      />
    </div>
  );
}