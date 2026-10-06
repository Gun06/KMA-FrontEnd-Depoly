"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import type { Editor } from "@tiptap/react";

import type { NoticeFile } from "@/types/notice";
import { useNoticeDetail, useUpdateNotice, useNoticeCategories } from "@/hooks/useNotices";
import type { NoticeDetail, NoticeCategory } from "@/services/admin/notices";
import { useAdminAuthStore } from "@/stores";
import { useQueryClient } from "@tanstack/react-query";
import { BoardDetailPage, BoardDetailPlaceholder } from '@/components/admin/boards/BoardDetailFrame';
import { BoardFormSaveToolbar } from '@/components/admin/boards/BoardAdminToolbar';
import { AdminNoticeFormBody } from '@/components/admin/boards/notice/AdminNoticeFormBody';
// ↑ saveMainNotice(noticeId: string|number, payload: {type,title,visibility,pinned?,content?,files?}) 를
// data/notice/main.ts에 구현해 두세요. (이벤트용 saveEventNotice와 동일 패턴)

export default function Page() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // API 훅들
  const { data: detail, isLoading, error } = useNoticeDetail(noticeId) as {
    data: NoticeDetail | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const updateMutation = useUpdateNotice(noticeId);
  const { data: categories } = useNoticeCategories() as {
    data: NoticeCategory[] | undefined;
  };
  
  // 현재 관리자 사용자 정보
  const { user } = useAdminAuthStore();

  const [categoryId, setCategoryId] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [files, setFiles] = React.useState<NoticeFile[]>([]);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const editorRef = React.useRef<Editor | null>(null);

  // 에디터 준비 완료 시 호출
  const handleEditorReady = (editor: Editor | null) => {
    editorRef.current = editor;
  };

  // 상세 데이터 로드 시 폼 초기화
  React.useEffect(() => {
    if (detail) {
      setTitle(detail.title);
      setContent(detail.content);
      // 첨부파일을 NoticeFile 형식으로 변환
      setFiles(detail.attachmentUrls?.map((url: string, index: number) => {
        const fileName = url.split('/').pop() || `첨부파일_${index + 1}`;
        return {
          id: url,
          url,
          name: fileName,
          sizeMB: 1 // 기본값 설정
        };
      }) || []);
      // 카테고리 설정 (noticeCategoryId 우선, 없으면 categoryId 사용)
      const actualCategoryId = detail.noticeCategoryId || detail.categoryId;
      if (actualCategoryId) {
        setCategoryId(actualCategoryId);
      } else {
        setCategoryId("801"); // 기본값: 공지
      }
    }
  }, [detail]);

  // 카테고리 옵션 생성
  const categoryOptions = categories?.map(category => ({
    label: category.name,
    value: category.id,
  })) || [];


  const onSave = () => {
    if (!title.trim()) { 
      alert("제목을 입력하세요."); 
      return; 
    }
    if (!categoryId) { 
      alert("카테고리를 선택하세요."); 
      return; 
    }

    // 저장 시 에디터에서 최신 HTML 가져오기 (작성한 대로 그대로 저장)
    let finalContent = content;
    if (editorRef.current) {
      finalContent = editorRef.current.getHTML();
    }

    // 파일을 File 객체로 변환
    const fileObjects = files
      .filter(file => file.file) // file 속성이 있는 것만 필터링
      .map(file => file.file!); // 실제 File 객체 사용

    // 기존 첨부파일 URL들 (삭제할 파일들)
    const originalFileUrls = detail?.attachmentUrls || [];
    const currentFileUrls = files
      .filter(file => file.url && !file.file) // 새로 추가되지 않은 기존 파일들
      .map(file => file.url!);
    const deletedFileUrls = originalFileUrls.filter(url => !currentFileUrls.includes(url));


    // FormData 생성
    const formData = new FormData();
    formData.append('noticeUpdate', JSON.stringify({
      title: title.trim(),
      content: finalContent,
      categoryId,
      author: user?.account || '관리자', // 작성자 정보
      deleteFileUrls: deletedFileUrls, // 삭제할 파일 URL들
      // TODO: 백엔드에서 visible, pinned 필드 지원 시 추가
      // visible: visibility === 'open',
      // pinned: canPin ? pinned : false,
    }));
    
    if (fileObjects.length > 0) {
      fileObjects.forEach(file => {
        formData.append('attachments', file);
      });
    }

    updateMutation.mutate(
      formData,
      {
        onSuccess: () => {
          // 캐시 무효화를 위해 쿼리 키 무효화
          queryClient.invalidateQueries({ queryKey: ['notice', 'detail', noticeId] });
          queryClient.invalidateQueries({ queryKey: ['notice', 'homepage'] });
          queryClient.invalidateQueries({ queryKey: ['notice'] });
          
          // 성공 모달 표시
          setShowSuccessModal(true);
        },
        onError: (_error) => {
          alert('공지사항 수정에 실패했습니다.');
        }
      }
    );
  };

  const goView = () => router.replace(`/admin/boards/notice/main/${noticeId}?_r=${Date.now()}`);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder>공지사항을 불러오는 중...</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }

  if (error) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder tone="error">공지사항을 불러오는데 실패했습니다.</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }

  return (
    <>
      <BoardDetailPage>
        <AdminNoticeFormBody
          formTitle="공지 수정"
          titleAction={
            <BoardFormSaveToolbar
              onCancel={goView}
              onSave={onSave}
              pending={updateMutation.isPending}
              pendingLabel="저장 중..."
            />
          }
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categoryOptions={categoryOptions}
          title={title}
          onTitleChange={setTitle}
          content={content}
          onContentChange={setContent}
          onEditorReady={handleEditorReady}
          files={files}
          onFilesChange={setFiles}
          attachmentFormats="JPG, PNG, PDF, DOC, XLS, XLSX"
          disabled={updateMutation.isPending}
        />
      </BoardDetailPage>

    {/* 성공 모달 */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false);
        router.replace(`/admin/boards/notice/main/${noticeId}`);
      }}
      title="수정 완료!"
      message="공지사항이 성공적으로 수정되었습니다."
    />
    </>
  );
}
