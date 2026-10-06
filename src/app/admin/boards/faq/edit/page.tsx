'use client';

import { useState, useEffect } from 'react';
import TextField from '@/components/common/TextField/TextField';
import FileUploader from '@/components/common/Upload/FileUploader';
import SingleImageUploader from '@/components/common/Upload/SingleImageUploader';
import { BoardDetailPage, BoardFormCard } from '@/components/admin/boards/BoardDetailFrame';
import { BoardFormSaveToolbar } from '@/components/admin/boards/BoardAdminToolbar';
import { FaqFormEditors } from '@/components/admin/boards/faq/FaqFormEditors';

export default function Page() {
  const [title, setTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: 실제 API 호출로 대체
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      alert('FAQ가 성공적으로 저장되었습니다!');
    } catch (_error) {
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || questionContent || answerContent) {
      const confirmed = confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?');
      if (!confirmed) return;
    }
  };

  const toolbar = (
    <BoardFormSaveToolbar
      onCancel={handleCancel}
      onSave={handleSave}
      cancelLabel="취소"
      saveLabel="등록하기"
      pending={isLoading}
      pendingLabel="등록 중..."
    />
  );

  return (
    <BoardDetailPage>
      <FaqFormEditors
        cardTitle="FAQ 등록"
        titleAction={toolbar}
        titleField={
          <TextField
            type="text"
            placeholder="제목을 입력하세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="flat"
            heightPx={52}
            fontSizePx={13}
            className="w-full min-w-0"
            disabled={isLoading}
          />
        }
        onQuestionChange={setQuestionContent}
        onAnswerChange={setAnswerContent}
      />

      <BoardFormCard title="미디어·첨부">
        <div className="space-y-4">
          <SingleImageUploader label="대표 이미지 업로드" maxSizeMB={20} onChange={() => {}} />
          <FileUploader
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            label="첨부파일 업로드"
            maxCount={10}
            maxSizeMB={20}
            multiple
            totalMaxMB={200}
          />
        </div>
      </BoardFormCard>
    </BoardDetailPage>
  );
}
