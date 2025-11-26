"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import { useNoticeDetail, useNoticeCategories } from "@/hooks/useNotices";
import type { NoticeDetail, NoticeCategory } from "@/services/admin/notices";
import { useAuthStore } from "@/store/authStore";

// 날짜시간 포맷팅 함수 (백엔드에서 한국시간으로 제공)
function formatDateTime(dateString: string): string {
  // ISO 8601 형식의 날짜 문자열을 파싱
  const date = new Date(dateString);
  
  // 백엔드에서 이미 한국시간으로 제공되므로 변환 없이 그대로 사용
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export default function Page() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const router = useRouter();

  // API에서 공지사항 상세 조회
  const { data: detail, isLoading, error } = useNoticeDetail(noticeId) as {
    data: NoticeDetail | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  // TODO: 백엔드 팀에 상세 API에 viewCount 필드 추가 요청
  // 현재 상세 API에는 조회수 정보가 없음

  
  // 카테고리 목록 조회
  const { data: categories } = useNoticeCategories() as {
    data: NoticeCategory[] | undefined;
  };
  
  // 현재 사용자 정보
  const { user } = useAuthStore();

  const goList = () => router.replace(`/admin/boards/notice/main?_r=${Date.now()}`);
  const goEdit = () => router.push(`/admin/boards/notice/main/${noticeId}/edit`);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="ml-auto flex gap-2">
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goList}>목록으로</Button>
            <Button size="sm" tone="primary" widthType="pager" onClick={goEdit}>수정하기</Button>
          </div>
        </div>
        <div className="rounded-xl border p-8 text-center text-gray-500">
          공지사항을 불러오는 중...
        </div>
      </main>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="ml-auto flex gap-2">
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goList}>목록으로</Button>
            <Button size="sm" tone="primary" widthType="pager" onClick={goEdit}>수정하기</Button>
          </div>
        </div>
        <div className="rounded-xl border p-8 text-center text-red-500">
          공지사항을 불러오는데 실패했습니다.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <div className="ml-auto flex gap-2">
          <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goList}>목록으로</Button>
          <Button size="sm" tone="primary" widthType="pager" onClick={goEdit}>수정하기</Button>
        </div>
      </div>

      {!detail ? (
        <div className="rounded-xl border p-8 text-center text-gray-500">데이터가 없습니다.</div>
      ) : (
        <article className="rounded-xl border bg-white">
          <header className="px-6 pt-6 pb-2">
            {/* 카테고리 뱃지 */}
            {(detail.noticeCategoryId || detail.categoryId) && categories && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {categories.find(cat => cat.id === (detail.noticeCategoryId || detail.categoryId))?.name || '카테고리'}
                </span>
              </div>
            )}
            <h1 className="text-xl font-semibold">{detail.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              작성자 {detail.author || user?.account || '관리자'} · {formatDateTime(detail.createdAt)}
              {/* TODO: 백엔드에서 viewCount 필드 제공 시 활성화 */}
              {/* <span className="ml-2">· 조회수 {detail.viewCount?.toLocaleString()}</span> */}
            </p>
          </header>
          <div className="h-px bg-gray-100" />
          <div
            className="px-6 py-6 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: detail.content ?? "" }}
          />
          <div className="px-6 pb-6">
            <BoardFileBox variant="view" files={(detail.attachmentUrls || detail.files || [])
              ?.filter((url: string) => !url.startsWith('blob:')) // blob URL 제외
              ?.map((url: string, index: number) => {
                // 상대 경로를 절대 경로로 변환
                const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
                
                // URL에서 파일명 추출
                const fileName = url.split('/').pop() || `첨부파일_${index + 1}`;
                return {
                  id: fullUrl,
                  url: fullUrl,
                  name: fileName,
                  sizeMB: 1 // 실제 크기는 API에서 제공되지 않으므로 기본값 설정
                };
              }) ?? []} />
          </div>
        </article>
      )}
    </main>
  );
}
