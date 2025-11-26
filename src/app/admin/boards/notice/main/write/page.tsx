// src/app/admin/boards/notice/main/write/page.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import SelectMenu from "@/components/common/filters/SelectMenu";
import TextField from "@/components/common/TextField/TextField";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";

import type { NoticeFile } from "@/types/notice";
import { useCreateHomepageNotice, useNoticeCategories } from "@/hooks/useNotices";
import type { NoticeCategory } from "@/services/admin/notices";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // API 훅들
  const createMutation = useCreateHomepageNotice();
  const { data: categories } = useNoticeCategories() as {
    data: NoticeCategory[] | undefined;
  };
  
  // 현재 사용자 정보
  const { user } = useAuthStore();

  const [categoryId, setCategoryId] = React.useState<string>("");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [files, setFiles] = React.useState<NoticeFile[]>([]);

  // 카테고리 변경 시 처리
  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId);
  };


  const onSave = async () => {
    if (!title.trim()) { 
      alert("제목을 입력하세요."); 
      return; 
    }
    if (!categoryId) { 
      alert("카테고리를 선택하세요."); 
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
      content,
      author: user?.account || '관리자', // 작성자 정보
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
        queryKey: ['notice', 'main'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['notice'] 
      });
      
      // 즉시 상세 페이지로 이동
      router.replace(`/admin/boards/notice/main/${data.id}`);
      
      // 이동 후 성공 메시지 표시
      setTimeout(() => {
        alert('공지사항이 성공적으로 등록되었습니다.');
      }, 100);
    } catch (_error) {
      alert('공지사항 생성에 실패했습니다.');
    }
  };

  const goBack = () => router.replace(`/admin/boards/notice/main?_r=${Date.now()}`);

  // 카테고리 옵션 생성
  const categoryOptions = categories?.map(category => ({
    label: category.name,
    value: category.id,
  })) || [];

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          tone="outlineDark" 
          variant="outline" 
          widthType="pager" 
          onClick={goBack}
          disabled={createMutation.isPending}
        >
          취소하기
        </Button>
        <Button 
          size="sm" 
          tone="primary" 
          widthType="pager" 
          onClick={onSave}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? '등록 중...' : '등록하기'}
        </Button>
      </div>

      {/* 1줄: 카테고리 + 제목 */}
      <div className="flex gap-3 items-center">
        <SelectMenu
          label="카테고리"
          value={categoryId}
          onChange={handleCategoryChange}
          options={categoryOptions}
          buttonTextMode="current"
          className="!h-12"
        />
        <TextField
          type="text"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 !h-12"
        />
      </div>


      {/* 에디터 */}
      <TextEditor 
        initialContent={content} 
        onChange={setContent} 
        height="520px" 
        imageDomainType="NOTICE"
        placeholder="내용을 작성해주세요..."
      />

      {/* 첨부파일 */}
      <div className="space-y-2">
        <BoardFileBox
          variant="edit"
          title="첨부파일"
          files={files}
          onChange={setFiles}
          label="첨부파일 업로드"
          maxCount={10}
          maxSizeMB={20}
          totalMaxMB={200}
          multiple
          className="mt-2"
          showQuotaText={false}
        />
        <div className="text-sm text-gray-500 px-1 pt-1">
          <p>• 텍스트 에디터 내 이미지: JPG, PNG (크기 조절 가능)</p>
          <p>• 첨부파일: JPG, PNG, PDF, DOC, XLS, XLSX</p>
          <p>• 첨부파일 이름이 너무 길면 등록이 실패할 수 있습니다</p>
        </div>
      </div>
    </main>
  );
}
