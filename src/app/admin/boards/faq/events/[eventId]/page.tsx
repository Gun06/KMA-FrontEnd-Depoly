"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import FaqListPage from "@/components/admin/boards/faq/FaqListPage";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { useEventFaqs, faqKeys } from "@/hooks/useFaqs";
import { deleteFaq } from "@/services/admin/faqs";
import type { FaqSearchParams, FaqListResponse } from "@/types/faq";

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // 검색 파라미터 상태
  const [searchParams, setSearchParams] = React.useState<FaqSearchParams>({
    page: 1,
    size: 20,
    // FAQ는 정렬 파라미터를 지원하지 않음
  });

  // 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // 대회별 FAQ 목록 조회
  const { data: faqData, isLoading, error } = useEventFaqs(eventId!, searchParams);
  const typedFaqData = faqData as { faqList: FaqListResponse; eventName: string } | undefined;
  
  // API에서 받은 eventName 사용 (없으면 fallback)
  const eventTitle = typedFaqData?.eventName ?? `#${eventId}`;

  // FAQ 삭제 핸들러
  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    
    setIsDeleting(true);
    try {
      await deleteFaq(deleteTargetId);
      
      // 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: faqKeys.event(eventId!) });
      
      // 현재 페이지가 마지막 페이지이고 삭제 후 빈 페이지가 되면 이전 페이지로 이동
      if (typedFaqData && typedFaqData.faqList.content && typedFaqData.faqList.content.length === 1 && typedFaqData.faqList.number > 0) {
        setSearchParams(prev => ({
          ...prev,
          page: Math.max(1, prev.page! - 1)
        }));
      }
      
      // 성공 처리
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setShowSuccessModal(true);
    } catch (_error) {
      console.error("Failed to delete FAQ:", _error);
      setErrorMessage("FAQ 삭제에 실패했습니다.\n다시 시도해주세요.");
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // 검색 파라미터 업데이트 (useCallback으로 최적화)
  const updateSearchParams = React.useCallback((updates: Partial<FaqSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...updates,
      page: updates.page || 1, // 검색 조건 변경 시 첫 페이지로
    }));
  }, []);

  // 검색 핸들러
  const handleSearch = React.useCallback((q: string, _searchMode: string) => {
    updateSearchParams({
      keyword: q || undefined,
      // FAQSearchKey 제거 (API에서 지원하지 않음)
    });
  }, [updateSearchParams]);

  // 리셋 핸들러
  const handleReset = React.useCallback(() => {
    updateSearchParams({
      keyword: undefined,
      // FAQSearchKey 제거
    });
  }, [updateSearchParams]);

  // 페이지 변경 핸들러
  const handlePageChange = React.useCallback((newPage: number) => {
    updateSearchParams({ page: newPage });
  }, [updateSearchParams]);

  // provider 함수를 useCallback으로 최적화 (페이지네이션 지원)
  const provider = React.useCallback((page: number, size: number, opt: { q: string; sort: string; searchMode: string }) => {
    // 검색 조건이 있으면 onSearch 호출 (실제 API 검색)
    if (opt.q && opt.q !== searchParams.keyword) {
      handleSearch(opt.q, opt.searchMode);
    }
    
    if (!typedFaqData || !typedFaqData.faqList.content) return { rows: [], total: 0 };
    
    // 현재 페이지의 데이터만 반환 (API에서 이미 페이지별로 데이터를 받아옴)
    return {
      rows: typedFaqData.faqList.content.map((item) => ({
        id: item.id,
        no: item.no,
        title: item.problem,
        question: item.problem,
        createdAt: item.createdAt,
        answer: {
          content: item.solution,
        }
      })),
      total: typedFaqData.faqList.totalElements || 0
    };
  }, [typedFaqData, searchParams.keyword, handleSearch]);

  if (error) {
    return (
      <div className="mx-auto max-w-[1300px] px-4 py-6">
        <div className="text-center text-red-500">FAQ 목록을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <>
      <FaqListPage
        title={
          <span>
            선택대회 : <span className="text-[#1E5EFF]">{eventTitle}</span> FAQ
          </span>
        }
        headerButton={{
          label: "공통 FAQ 관리하기 >",
          size: "sm",
          tone: "primary",
          onClick: () => router.push("/admin/boards/faq/main"),
        }}
        provider={provider}
        linkForRow={(r) => `/admin/boards/faq/events/${eventId}/${r.id}`}
        onDelete={handleDelete}
        onSearch={handleSearch}
        onReset={handleReset}
        onPageChange={handlePageChange}
        currentPage={searchParams.page}
        createHref={`/admin/boards/faq/events/${eventId}/write`}
        isLoading={isLoading}
      />

      {/* 삭제 확인 모달 */}
    <ConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => {
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      }}
      onConfirm={confirmDelete}
      title="FAQ 삭제"
      message="이 FAQ를 삭제하시겠습니까?"
      confirmText="삭제"
      cancelText="취소"
      variant="danger"
      isLoading={isDeleting}
    />

    {/* 성공 모달 */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      title="삭제 완료!"
      message="FAQ가 성공적으로 삭제되었습니다."
    />

    {/* 실패 모달 */}
    <ErrorModal
      isOpen={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      title="삭제 실패"
      message={errorMessage}
    />
    </>
  );
}
