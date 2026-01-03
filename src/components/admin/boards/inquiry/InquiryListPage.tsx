"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";
import InquiryTable from "@/components/admin/boards/inquiry/InquiryTable";
import type { Inquiry } from "@/types/inquiry";
import { useHomepageInquiries, useEventInquiries, useAllInquiries } from "@/hooks/useInquiries";
import { InquiryItem, deleteInquiry, deleteAnswer, resetInquiryPassword } from "@/services/admin/inquiries";
import { useQueryClient } from "@tanstack/react-query";
import { inquiryKeys } from "@/hooks/useInquiries";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import PasswordModal from "@/components/common/Modal/PasswordModal";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import ErrorModal from "@/components/common/Modal/ErrorModal";

type SearchMode = "all" | "name" | "post";
export type ViewRow = Inquiry & { __replyOf?: string; __answerId?: string; secret?: boolean };

type Props = {
  // API 연동을 위한 새로운 props
  apiType?: 'homepage' | 'event' | 'all';
  eventId?: string;
  currentPage?: number;
  titleAddon?: React.ReactNode;
  
  // 기존 props (하위 호환성을 위해 유지)
  provider?: (page: number, pageSize: number, opt: {
    q: string; searchMode: SearchMode;
  }) => { rows: ViewRow[]; total: number };
  
  linkForRow: (row: ViewRow) => string;
  onDelete: (id: string, meta?: { total: number; page: number; pageSize: number }) => void;
  title: React.ReactNode;
  headerButton?: {
    label: string;
    onClick: () => void;
    size?: "sm" | "md" | "lg";
    tone?: "primary" | "competition";
  };
  presetKey?: keyof typeof PRESETS;
  providerIsExpanded?: boolean;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 16;

export default function InquiryListPage({
  apiType,
  eventId,
  currentPage,
  provider,
  linkForRow,
  onDelete: _onDelete,
  title,
  headerButton,
  titleAddon,
  presetKey = "관리자 / 대회_문의사항",
  providerIsExpanded: _providerIsExpanded = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();
  const searchParamsString = searchParamsHook?.toString() || '';
  const pageFromSearchParams = React.useMemo(() => {
    const value = searchParamsHook?.get?.("page");
    const next = Number(value);
    if (!Number.isNaN(next) && next > 0) return next;
    return undefined;
  }, [searchParamsHook]);
  const normalizedCurrentPage = React.useMemo(() => {
    if (typeof currentPage === 'number' && currentPage > 0) return currentPage;
    return undefined;
  }, [currentPage]);

  const [page, setPage] = React.useState<number>(normalizedCurrentPage ?? pageFromSearchParams ?? 1);
  const [q, setQ] = React.useState("");
  const [searchMode, setSearchMode] = React.useState<SearchMode>("all");
  
  // URL 파라미터에서 isAnswered 초기값 읽기
  const initialIsAnswered = React.useMemo(() => {
    const value = searchParamsHook?.get?.("isAnswered");
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  }, [searchParamsHook]);
  
  const [isAnswered, setIsAnswered] = React.useState<boolean | undefined>(initialIsAnswered);
  const [_rev, setRev] = React.useState(0);
  
  // 비밀번호 초기화 모달 상태
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = React.useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (normalizedCurrentPage && normalizedCurrentPage !== page) {
      setPage(normalizedCurrentPage);
      return;
    }
    if (!normalizedCurrentPage && pageFromSearchParams && pageFromSearchParams !== page) {
      setPage(pageFromSearchParams);
    }
  }, [normalizedCurrentPage, pageFromSearchParams, page]);

  // URL 파라미터 변경 시 isAnswered 상태 업데이트
  React.useEffect(() => {
    if (initialIsAnswered !== isAnswered) {
      setIsAnswered(initialIsAnswered);
    }
  }, [initialIsAnswered]);

  const updatePageInUrl = React.useCallback((nextPage: number) => {
    if (!router || !pathname) return;
    const params = new URLSearchParams(searchParamsString);
    if (nextPage > 1) params.set('page', String(nextPage));
    else params.delete('page');
    const queryString = params.toString();
    const target = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(target, { scroll: false });
  }, [router, pathname, searchParamsString]);

  const handlePageChange = React.useCallback((nextPage: number) => {
    setPage(nextPage);
    updatePageInUrl(nextPage);
  }, [updatePageInUrl]);

  // API 연동 (검색 기능 포함)
  const searchParams = React.useMemo(() => ({
    keyword: q || undefined,
    questionSearchKey: q && searchMode !== 'all' ? (searchMode === 'name' ? 'AUTHOR' as const : 'TITLE' as const) : undefined,
    isAnswered,
    page,
    size: pageSize,
  }), [q, searchMode, isAnswered, page, pageSize]);

  const { data: homepageData, isLoading: homepageLoading, error: homepageError } = useHomepageInquiries(
    searchParams,
    { enabled: !apiType || apiType === 'homepage' }
  );
  const { data: eventData, isLoading: eventLoading, error: eventError } = useEventInquiries(
    eventId || '',
    searchParams,
    { enabled: apiType === 'event' }
  );
  const { data: allData, isLoading: allLoading, error: allError } = useAllInquiries(
    searchParams,
    { enabled: apiType === 'all' }
  );

  // API 데이터 선택
  const inquiryData =
    apiType === 'event' ? eventData :
    apiType === 'all' ? allData :
    homepageData;
  const isLoading =
    apiType === 'event' ? eventLoading :
    apiType === 'all' ? allLoading :
    homepageLoading;
  const error =
    apiType === 'event' ? eventError :
    apiType === 'all' ? allError :
    homepageError;

  // API 데이터를 ViewRow 형식으로 변환 (최적화)
  const viewRows: ViewRow[] = React.useMemo(() => {
    const data = inquiryData as { content?: InquiryItem[] } | undefined;
    if (!data?.content) return [];
    
    const rows: ViewRow[] = [];
    
    // forEach 대신 for...of 사용으로 성능 향상
    for (let i = 0; i < data.content.length; i++) {
      const item = data.content[i];
      
      // 날짜 포맷팅 최적화
      const formattedDate = item.createdAt.split('T')[0].replace(/-/g, '.');
      
      // 원글 추가
      const baseRow: ViewRow = {
        id: item.id,
        title: item.title, // 관리자는 비밀글도 실제 제목 표시
        author: item.author,
        date: formattedDate,
        views: 0,
        content: '',
        answered: item.answered,
        no: item.no, // API에서 제공하는 번호 사용
        secret: item.secret, // 비밀글 정보는 유지 (UI 표시용)
      };
      baseRow.eventName = item.eventName;

      rows.push(baseRow);

      // 답변이 있는 경우 답변 행 추가
      if (item.answer) {
        const answerDate = item.answer.createdAt.split('T')[0].replace(/-/g, '.');
        
        rows.push({
          ...baseRow,
          id: `reply-${item.id}`,
          title: item.answer.title, // 관리자는 답변도 실제 제목 표시
          __replyOf: String(baseRow.id),
          __answerId: item.answer.id,
          author: item.answer.author,
          date: answerDate,
          content: '',
          no: undefined, // 답변은 번호 없음
          secret: item.secret, // 비밀글 정보 유지
          files: item.answer.attachmentUrls?.map((url: string, index: number) => ({
            id: `answer-file-${index}`,
            name: url.split('/').pop() || `답변첨부파일-${index + 1}`,
            sizeMB: 0,
            mime: 'application/octet-stream',
            url: url
          })) || [],
          answered: item.answered,
        });
      }
    }

    return rows;
  }, [inquiryData]);

  const total = (inquiryData as { totalElements?: number })?.totalElements || 0;
  const showEventName = apiType === 'all';

  // 기존 provider 방식 (하위 호환성)
  const legacyRows = React.useMemo(() => {
    if (!provider) return { rows: [], total: 0 };
    return provider(page, pageSize, {
      q,
      searchMode,
    });
  }, [provider, page, pageSize, q, searchMode]);

  // 최종 데이터 선택
  const finalRows = apiType ? viewRows : legacyRows.rows;
  const finalTotal = apiType ? total : legacyRows.total;

  const preset = PRESETS[presetKey]?.props;
  const norm = (s?: string) => (s ?? "").replace(/\s/g, "");

  // FilterBar 초기값 (URL 파라미터 반영 - 한 번만 계산)
  const filterInitialValues = React.useMemo(() => {
    const answeredValue = initialIsAnswered === true ? "true" : initialIsAnswered === false ? "false" : "";
    return ["all", answeredValue];
  }, [initialIsAnswered]);

  const filterControls = preset && (
    <div className="flex flex-wrap items-center gap-2">
      <FilterBar
        key={`filter-${initialIsAnswered}`} // URL 파라미터 변경 시 FilterBar 재마운트
        {...preset}
        className="!gap-3"
        initialValues={filterInitialValues}
        onFieldChange={(label, value) => {
          const L = norm(String(label));
          if (L === "검색키") setSearchMode(value as SearchMode);
          if (L === "답변상태") {
            if (value === "true") setIsAnswered(true);
            else if (value === "false") setIsAnswered(false);
            else setIsAnswered(undefined);
          }
          setPage(1);
        }}
        onSearch={(value) => { setQ(value); setPage(1); }}
        onReset={() => { setQ(""); setSearchMode("all"); setIsAnswered(undefined); setPage(1); }}
      />
    </div>
  );

  const handleDelete = async (id: string) => {
    if (!confirm("문의사항을 삭제하시겠습니까?")) return;
    
    try {
      await deleteInquiry(id);
      
      // 캐시 무효화
      if (apiType === 'homepage' || !apiType) {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.homepage() }); // 모든 페이지 무효화
      }
      if (apiType === 'event' && eventId) {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.event(eventId) }); // 모든 페이지 무효화
      }
      if (apiType === 'all') {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.all }); // 전체 문의사항 캐시 무효화
      }
      
      // 페이지 조정
      const newTotal = Math.max(0, finalTotal - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      setRev((v) => v + 1);
      
      alert('문의사항이 삭제되었습니다.');
    } catch (_error) {
      alert('문의사항 삭제에 실패했습니다.');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("답변을 삭제하시겠습니까?")) return;
    
    try {
      await deleteAnswer(answerId);
      
      // 백엔드에서 답변 삭제 시 해당 문의사항의 answered를 false로 자동 업데이트
      // 캐시 무효화를 통해 업데이트된 데이터를 다시 가져옴
      if (apiType === 'homepage' || !apiType) {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.homepage() }); // 모든 페이지 무효화
      }
      if (apiType === 'event' && eventId) {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.event(eventId) }); // 모든 페이지 무효화
      }
      if (apiType === 'all') {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.all }); // 전체 문의사항 캐시 무효화
      }
      
      setRev((v) => v + 1);
      alert('답변이 삭제되었습니다.');
    } catch (_error) {
      alert('답변 삭제에 실패했습니다.');
    }
  };

  const handleResetPasswordClick = (id: string) => {
    setSelectedInquiryId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmReset = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedInquiryId) return;
    
    if (password.length < 4) {
      setErrorMessage('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    
    setErrorMessage(''); // 에러 메시지 초기화
    setIsResettingPassword(true);
    
    try {
      await resetInquiryPassword(selectedInquiryId, password);
      
      // 캐시 무효화
      if (apiType === 'homepage' || !apiType) {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.homepage() });
      }
      if (apiType === 'event' && eventId) {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.event(eventId) });
      }
      if (apiType === 'all') {
        queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
      }
      
      setShowPasswordModal(false);
      setShowSuccessModal(true);
      setSelectedInquiryId(null);
    } catch (_error) {
      setShowPasswordModal(false);
      setShowErrorModal(true);
      setSelectedInquiryId(null);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCloseModals = () => {
    setShowConfirmModal(false);
    setShowPasswordModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setSelectedInquiryId(null);
    setErrorMessage("");
    setIsResettingPassword(false);
  };
  
  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setErrorMessage("");
  };

  const composeLinkWithPage = React.useCallback((row: ViewRow) => {
    const base = linkForRow(row);
    if (!base) return base;
    const [beforeHash, hash] = base.split('#');
    const [path, queryString] = beforeHash.split('?');
    const params = new URLSearchParams(queryString || '');
    params.set('page', String(page));
    const newBeforeHash = `${path}?${params.toString()}`;
    return hash ? `${newBeforeHash}#${hash}` : newBeforeHash;
  }, [linkForRow, page]);

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          {titleAddon}
        </div>
        {headerButton && (
          <Button {...headerButton}>
            {headerButton.label}
          </Button>
        )}
      </div>

      {filterControls}

      {/* 로딩 상태 - 테이블 영역에만 표시 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 border border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-gray-500 text-sm">문의사항을 불러오는 중...</div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 border border-red-200 rounded-lg bg-red-50">
          <div className="text-red-500">문의사항을 불러오는데 실패했습니다.</div>
        </div>
      ) : (
        <InquiryTable
          rows={finalRows}
          linkForRow={composeLinkWithPage}
          showEventNameColumn={showEventName}
          pagination={{ page, pageSize, total: finalTotal, onChange: handlePageChange, align: "right" }}
          onDelete={handleDelete}
          onDeleteAnswer={handleDeleteAnswer}
          onResetPassword={handleResetPasswordClick}
        />
      )}

      {/* 비밀번호 초기화 확인 모달 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModals}
        onConfirm={handleConfirmReset}
        title="비밀번호 초기화"
        message="문의사항 비밀번호를 초기화하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        isLoading={isResettingPassword}
      />

      {/* 비밀번호 입력 모달 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordSubmit}
        title="비밀번호 초기화"
        message="새 비밀번호를 입력해주세요."
        isLoading={isResettingPassword}
        externalError={errorMessage}
      />

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModals}
        title="초기화 완료"
        message="비밀번호가 성공적으로 초기화되었습니다."
      />

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleCloseModals}
        title="초기화 실패"
        message={errorMessage || "비밀번호 초기화에 실패했습니다."}
        confirmText="확인"
      />
    </div>
  );
}
