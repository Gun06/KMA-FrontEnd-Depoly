// src/app/admin/boards/notice/events/[eventId]/write/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import type { Editor } from "@tiptap/react";

import type { NoticeFile } from "@/types/notice";
import { useCreateEventNotice, useNoticeCategories } from "@/hooks/useNotices";
import type { NoticeCategory } from "@/services/admin/notices";
import { useAdminAuthStore } from "@/stores";
import { useQueryClient } from "@tanstack/react-query";
import { BoardDetailPage } from "@/components/admin/boards/BoardDetailFrame";
import { BoardFormSaveToolbar } from "@/components/admin/boards/BoardAdminToolbar";
import { AdminNoticeFormBody } from "@/components/admin/boards/notice/AdminNoticeFormBody";

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // API 훅들
  const createMutation = useCreateEventNotice(eventId);
  const { data: categories } = useNoticeCategories() as {
    data: NoticeCategory[] | undefined;
  };
  
  // 현재 관리자 사용자 정보
  const { user } = useAdminAuthStore();

  const [categoryId, setCategoryId] = React.useState<string>("");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [files, setFiles] = React.useState<NoticeFile[]>([]);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [createdNoticeId, setCreatedNoticeId] = React.useState<string>("");
  const editorRef = React.useRef<Editor | null>(null);

  // 카테고리 변경 시 처리
  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId);
  };

  // 에디터 준비 완료 시 호출
  const handleEditorReady = (editor: Editor | null) => {
    editorRef.current = editor;
  };


  const onSave = async () => {
    // 제목 검증
    if (!title.trim()) { 
      alert("제목을 입력하세요."); 
      return; 
    }
    
    // 카테고리 검증
    if (!categoryId) { 
      alert("카테고리를 선택하세요."); 
      return; 
    }

    // 저장 시 에디터에서 최신 HTML 가져오기 (작성한 대로 그대로 저장)
    let finalContent = content;
    if (editorRef.current) {
      finalContent = editorRef.current.getHTML();
    }

    // 내용 검증: HTML 태그 제거 후 실제 텍스트가 있는지 확인
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = finalContent || '';
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const hasContent = textContent.trim().length > 0;
    
    if (!hasContent) {
      alert("내용을 입력하세요.");
      return;
    }

    // 내용 길이 검증 (HTML 포함 전체 길이)
    if (finalContent.length > 50000) {
      alert("내용이 너무 깁니다. 50,000자 이하로 작성해주세요.");
      return;
    }

    // 작성자 정보 확인
    if (!user?.account) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 파일을 File 객체로 변환
    const fileObjects = files
      .filter(file => file.file) // file 속성이 있는 것만 필터링
      .map(file => file.file!); // 실제 File 객체 사용

    // FormData 생성
    const formData = new FormData();
    formData.append('noticeCreate', JSON.stringify({
      categoryId,
      title: title.trim(),
      content: finalContent,
      author: user.account,
    }));
    
    if (fileObjects.length > 0) {
      fileObjects.forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      const response = await createMutation.mutateAsync(formData);
      const data = response as { id: string };
      
      // 캐시 무효화 - 목록 데이터 새로고침
      queryClient.invalidateQueries({ 
        queryKey: ['notice', 'event', eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['notice'] 
      });
      
      // 생성된 공지사항 ID 저장
      setCreatedNoticeId(data.id);
      
      // 성공 모달 표시
      setShowSuccessModal(true);
    } catch (_error) {
      alert('공지사항 생성에 실패했습니다.');
    }
  };

  const goBack = () =>
    router.replace(`/admin/boards/notice/events/${eventId}?_r=${Date.now()}`);

  // 카테고리 옵션 생성
  const categoryOptions = categories?.map(category => ({
    label: category.name,
    value: category.id,
  })) || [];


  return (
    <>
      <BoardDetailPage>
        <AdminNoticeFormBody
          formTitle="대회 공지 등록"
          titleAction={
            <BoardFormSaveToolbar
              onCancel={goBack}
              onSave={onSave}
              saveLabel="등록하기"
              pending={createMutation.isPending}
              pendingLabel="등록 중..."
            />
          }
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          categoryOptions={categoryOptions}
          title={title}
          onTitleChange={setTitle}
          content={content}
          onContentChange={setContent}
          onEditorReady={handleEditorReady}
          files={files}
          onFilesChange={setFiles}
          disabled={createMutation.isPending}
        />
      </BoardDetailPage>

    {/* 성공 모달 */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false);
        // 등록된 공지사항 상세 페이지로 바로 이동
        if (createdNoticeId) {
          router.replace(`/admin/boards/notice/events/${eventId}/${createdNoticeId}`);
        } else {
          router.replace(`/admin/boards/notice/events/${eventId}`);
        }
      }}
      title="등록 완료!"
      message="공지사항이 성공적으로 등록되었습니다."
    />
    </>
  );
}
