// src/app/admin/applications/management/[eventId]/Client.tsx
'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useRegistrationList, useRegistrationSearch, useRegistrationDetail } from '@/hooks/useRegistration';
import { useEventList } from '@/hooks/useNotices';
import ApplicantsManageTable from '@/components/admin/applications/ApplicantsManageTable';
import RegistrationDetailDrawer from '@/components/admin/applications/RegistrationDetailDrawer';
import PaymentUploadModal from '@/components/admin/applications/PaymentUploadModal';
import GroupUploadModal from '@/components/admin/applications/GroupUploadModal';
import PersonalUploadModal from '@/components/admin/applications/PersonalUploadModal';
import { downloadRegistrationList } from '@/services/registration';
import { downloadGroupForm, uploadGroupForm } from '@/components/admin/applications/api/groupUpload';
import { downloadPersonalForm } from '@/components/admin/applications/api/personalUpload';
import { useQueryClient } from '@tanstack/react-query';
import { toast, type Id } from 'react-toastify';
import { ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';
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
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const queryClient = useQueryClient();
  
  // URL에서 초기 상태 읽기
  const readInit = React.useCallback(() => {
    const page = Number(sp.get('page') ?? initialPage);
    const q = sp.get('q') ?? '';
    const field = (sp.get('field') as 'name' | 'org' | 'birth' | 'tel' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all') ?? 'all';
    const paid = (sp.get('paid') as PaidFilter) ?? '';
    const sort = (sp.get('sort') as SortKey) ?? 'id';
    return { page, q, field, paid, sort };
  }, [sp, initialPage]);

  const [page, setPage] = React.useState<number>(() => readInit().page);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = React.useState(false);
  
  // 선택된 대회 IDs (다중 선택 지원)
  const [selectedEventIds, setSelectedEventIds] = React.useState<string[]>([eventId]);

  const [query, setQuery] = React.useState<string>(() => readInit().q);
  const [paidFilter, setPaidFilter] = React.useState<PaidFilter>(() => readInit().paid);
  const [sortKey, setSortKey] = React.useState<SortKey>(() => readInit().sort);
  const [searchField, setSearchField] = React.useState<'name' | 'org' | 'birth' | 'tel' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all'>(() => readInit().field);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // eventId가 변경되면 selectedEventIds에 추가
  React.useEffect(() => {
    if (eventId && !selectedEventIds.includes(eventId)) {
      setSelectedEventIds(prev => [...prev, eventId]);
    }
  }, [eventId]);

  // 드롭다운 외부 클릭 감지
  const eventDropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    if (isEventDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEventDropdownOpen]);

  // URL 동기화
  const syncURL = React.useCallback(() => {
    const p = new URLSearchParams();
    if (page !== 1) p.set('page', String(page));
    if (query.trim()) p.set('q', query.trim());
    if (searchField !== 'all') p.set('field', searchField);
    if (paidFilter) p.set('paid', paidFilter);
    if (sortKey !== 'id') p.set('sort', sortKey);

    const next = p.toString() ? `${pathname}?${p.toString()}` : pathname;
    router.replace(next);
  }, [router, pathname, page, query, searchField, paidFilter, sortKey]);

  React.useEffect(() => {
    syncURL();
  }, [syncURL]);

  // 항상 검색 API 사용 (서버에서 정렬과 번호를 내려줌)
  const searchParams = React.useMemo(() => ({
    eventIds: selectedEventIds.length > 0 ? selectedEventIds : [eventId],
    page,
    size: pageSize,
    ...convertFiltersToApiParams(sortKey, paidFilter, query, searchField),
  }), [selectedEventIds, eventId, page, pageSize, sortKey, paidFilter, query, searchField]);

  // 항상 검색 API만 사용
  const { data: registrationData, isLoading, error } = useRegistrationSearch(searchParams, searchField as any);

  // 대회 정보 조회 (제목용 및 드롭다운용)
  const { data: eventListData } = useEventList(1, 100);
  const eventList = React.useMemo(() => 
    (eventListData as { content?: Array<{ id: string; nameKr?: string; nameEn?: string; startDate?: string; eventStatus?: string }> })?.content || [],
    [eventListData]
  );
  const currentEvent = React.useMemo(() => eventList.find((e) => e.id === eventId), [eventList, eventId]);
  const selectedEvents = React.useMemo(() => eventList.filter(e => selectedEventIds.includes(e.id)), [eventList, selectedEventIds]);
  
  // URL selection 쿼리에 따라 초기 선택 대회 설정
  const selection = sp.get('selection');
  const hasInitializedSelectionRef = React.useRef(false);
  
  React.useEffect(() => {
    if (hasInitializedSelectionRef.current) return;
    if (!eventList.length) return;

    if (selection === 'all') {
      setSelectedEventIds(eventList.map(e => e.id));
      hasInitializedSelectionRef.current = true;
    } else if (selection === 'open') {
      const openIds = eventList
        .filter(e => e.eventStatus === 'OPEN')
        .map(e => e.id);
      if (openIds.length > 0) {
        setSelectedEventIds(openIds);
        hasInitializedSelectionRef.current = true;
      }
    }
  }, [selection, eventList]);
  
  // 대회 토글 핸들러 (다중 선택)
  const handleEventToggle = (selectedEventId: string) => {
    setSelectedEventIds(prev => {
      if (prev.includes(selectedEventId)) {
        // 이미 선택된 경우 제거 (최소 1개는 유지)
        if (prev.length === 1) {
          toast.warning('최소 1개의 대회는 선택되어야 합니다.');
          return prev;
        }
        return prev.filter(id => id !== selectedEventId);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, selectedEventId];
      }
    });
    setPage(1); // 페이지 초기화
  };
  
  // 대회 제거 핸들러 (태그에서 X 클릭)
  const handleEventRemove = (eventIdToRemove: string) => {
    if (selectedEventIds.length === 1) {
      toast.warning('최소 1개의 대회는 선택되어야 합니다.');
      return;
    }
    setSelectedEventIds(prev => prev.filter(id => id !== eventIdToRemove));
    setPage(1);
  };
  
  // 전체 선택/해제
  const handleSelectAll = () => {
    const allIds = eventList.map(e => e.id);
    setSelectedEventIds(allIds);
    setPage(1);
  };
  
  const handleDeselectAll = () => {
    if (selectedEventIds.length === 1) {
      toast.warning('최소 1개의 대회는 선택되어야 합니다.');
      return;
    }
    // 현재 URL의 eventId만 남김
    setSelectedEventIds([eventId]);
    setPage(1);
  };

  // API 데이터를 테이블 형식으로 변환
  const data = React.useMemo(() => {
    if (!registrationData?.content) return [];
    
    // 변환 (서버에서 이미 검색과 정렬이 완료된 결과를 사용, no는 서버에서 내려주는 값 사용)
    return registrationData.content.map((item, index) => {
      const row = convertRegistrationToManageRow(item, index);
      // API 응답에 eventName이 없으면 currentEvent의 이름을 사용
      if (!row.eventName && currentEvent) {
        row.eventName = currentEvent.nameKr || currentEvent.nameEn || '';
      }
      return row;
    });
  }, [registrationData, currentEvent]);

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
  
  // 단체 신청 양식 업로드 모달 상태
  const [isGroupUploadModalOpen, setIsGroupUploadModalOpen] = React.useState(false);
  
  // 개인 신청 양식 업로드 모달 상태
  const [isPersonalUploadModalOpen, setIsPersonalUploadModalOpen] = React.useState(false);
  
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

  // Excel 다운로드 처리 (다중 대회 지원)
  const handleDownloadApplicants = async () => {
    try {
      const eventIdsToDownload = selectedEventIds.length > 0 ? selectedEventIds : [eventId];
      await downloadRegistrationList(eventIdsToDownload);
      toast.success(`선택된 ${eventIdsToDownload.length}개 대회의 Excel 다운로드가 완료되었습니다!`);
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
    // 데이터 새로고침 (exact: false로 패턴 매칭)
    await queryClient.invalidateQueries({ queryKey: ['registrationList'], exact: false });
    await queryClient.invalidateQueries({ queryKey: ['registrationSearch'], exact: false });
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
      await downloadGroupForm(eventId);
      toast.success('단체 신청 양식 다운로드가 완료되었습니다!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '다운로드에 실패했습니다.');
    }
  };

  // 단체 신청 양식 업로드 처리
  const handleUploadGroupForm = () => {
    setIsGroupUploadModalOpen(true);
  };
  
  // 단체 업로드 성공 후 처리
  const handleGroupUploadSuccess = async () => {
    // 데이터 새로고침 (exact: false로 패턴 매칭)
    await queryClient.invalidateQueries({ queryKey: ['registrationList'], exact: false });
    await queryClient.invalidateQueries({ queryKey: ['registrationSearch'], exact: false });
  };

  // 개인 신청 양식 다운로드 처리
  const handleDownloadPersonalForm = async () => {
    try {
      await downloadPersonalForm(eventId);
      toast.success('개인 신청 양식 다운로드가 완료되었습니다!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '다운로드에 실패했습니다.');
    }
  };

  // 개인 신청 양식 업로드 처리
  const handleUploadPersonalForm = () => {
    setIsPersonalUploadModalOpen(true);
  };
  
  // 개인 업로드 성공 후 처리
  const handlePersonalUploadSuccess = async () => {
    // 데이터 새로고침 (exact: false로 패턴 매칭)
    await queryClient.invalidateQueries({ queryKey: ['registrationList'], exact: false });
    await queryClient.invalidateQueries({ queryKey: ['registrationSearch'], exact: false });
  };

  // 툴바 액션 처리
  const handleToolbarAction = (action: 'downloadApplicants' | 'uploadPayments' | 'downloadGroupForm' | 'uploadGroupForm' | 'downloadPersonalForm' | 'uploadPersonalForm') => {
    if (action === 'downloadApplicants') {
      handleDownloadApplicants();
    } else if (action === 'uploadPayments') {
      handleUploadPayments();
    } else if (action === 'downloadGroupForm') {
      handleDownloadGroupForm();
    } else if (action === 'uploadGroupForm') {
      handleUploadGroupForm();
    } else if (action === 'downloadPersonalForm') {
      handleDownloadPersonalForm();
    } else if (action === 'uploadPersonalForm') {
      handleUploadPersonalForm();
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
      // 여기서는 쿼리 캐시만 무효화하여 데이터 새로고침 (exact: false로 패턴 매칭)
      await queryClient.invalidateQueries({
        queryKey: ['registrationList'],
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ['registrationSearch'],
        exact: false,
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
      {/* 대회 다중 선택 드롭다운 */}
      <div className="mb-4 space-y-3" ref={eventDropdownRef}>
        <div className="relative w-full">
          {/* 선택된 대회 태그들 */}
          {selectedEvents.length > 0 && (
            <div 
              className="mb-2 flex gap-2 overflow-x-auto pb-1 w-full no-scrollbar"
              onWheel={(e) => {
                e.currentTarget.scrollLeft += e.deltaY;
                e.preventDefault();
              }}
              style={{ 
                cursor: 'grab',
                WebkitOverflowScrolling: 'touch'
              }}
              onMouseDown={(e) => {
                // 태그 버튼 클릭은 스크롤과 구분
                if ((e.target as HTMLElement).closest('button')) return;
                
                const element = e.currentTarget;
                let isDown = true;
                let startX = e.pageX - element.offsetLeft;
                let scrollLeft = element.scrollLeft;

                const onMouseMove = (e: MouseEvent) => {
                  if (!isDown) return;
                  e.preventDefault();
                  const x = e.pageX - element.offsetLeft;
                  const walk = (x - startX) * 2;
                  element.scrollLeft = scrollLeft - walk;
                };

                const onMouseUp = () => {
                  isDown = false;
                  element.style.cursor = 'grab';
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };

                element.style.cursor = 'grabbing';
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            >
              {selectedEvents.map((event) => (
                <span
                  key={event.id}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium flex-shrink-0',
                    'bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap'
                  )}
                >
                  <span className="truncate">
                    {event.nameKr || event.nameEn || event.id}
                  </span>
                  {selectedEventIds.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventRemove(event.id);
                      }}
                      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors flex-shrink-0"
                      aria-label={`${event.nameKr || event.id} 제거`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
          
          {/* 드롭다운 버튼 */}
          <button
            type="button"
            onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
            className={clsx(
              'flex items-center justify-between w-auto min-w-[400px] max-w-[800px] px-4 py-2.5 text-sm font-medium',
              'bg-white border border-gray-300 rounded-md shadow-sm',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors'
            )}
            aria-haspopup="listbox"
            aria-expanded={isEventDropdownOpen}
          >
            <span className="text-left">
              {selectedEvents.length > 0 
                ? `${selectedEvents.length}개 대회의 신청자를 조회 중입니다.` 
                : '대회를 선택하세요'}
            </span>
            <ChevronDown
              className={clsx(
                'ml-2 h-4 w-4 text-gray-500 transition-transform flex-shrink-0',
                isEventDropdownOpen && 'rotate-180'
              )}
            />
          </button>
          
          {/* 드롭다운 메뉴 */}
          {isEventDropdownOpen && (
            <div className="absolute z-50 w-auto min-w-[400px] max-w-[800px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
              <div role="listbox" className="py-2">
                {/* 전체 선택/해제 */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventList.length > 0 && selectedEventIds.length === eventList.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAll();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        전체 선택 ({selectedEventIds.length}/{eventList.length})
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* 대회 목록 */}
                {eventList.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">등록된 대회가 없습니다.</div>
                ) : (
                  eventList.map((event) => {
                    const isSelected = selectedEventIds.includes(event.id);
                    return (
                      <label
                        key={event.id}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition-colors',
                          'hover:bg-gray-50',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleEventToggle(event.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={clsx(
                          'flex-1 truncate',
                          isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'
                        )}>
                          {event.nameKr || event.nameEn || event.id}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-blue-600 font-medium">선택됨</span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 데이터가 없을 때 안내 메시지 */}
      {!isLoading && rows.length === 0 && total === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">신청자가 없습니다.</p>
          <p className="text-sm text-gray-500">
            선택된 대회({selectedEvents.map(e => e.nameKr || e.nameEn || e.id).join(', ')})에 등록된 신청자가 없습니다.
          </p>
        </div>
      )}

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
            // 저장 후 목록 및 상세 새로고침 (exact: false로 패턴 매칭)
            await queryClient.invalidateQueries({ queryKey: ['registrationList'], exact: false });
            await queryClient.invalidateQueries({ queryKey: ['registrationSearch'], exact: false });
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

      {/* 단체 신청 양식 업로드 모달 */}
      <GroupUploadModal
        isOpen={isGroupUploadModalOpen}
        onClose={() => setIsGroupUploadModalOpen(false)}
        eventId={eventId}
        onSuccess={handleGroupUploadSuccess}
      />

      {/* 개인 신청 양식 업로드 모달 */}
      <PersonalUploadModal
        isOpen={isPersonalUploadModalOpen}
        onClose={() => setIsPersonalUploadModalOpen(false)}
        eventId={eventId}
        onSuccess={handlePersonalUploadSuccess}
      />
    </div>
  );
}