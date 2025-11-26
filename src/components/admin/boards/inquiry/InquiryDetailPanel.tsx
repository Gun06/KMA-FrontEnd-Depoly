"use client";

import React from "react";
import { sanitizeHtml } from "@/utils/sanitize";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import type { Inquiry, InquiryFile } from "@/types/inquiry";
import { Lock } from "lucide-react";

type Props = {
  detail: Inquiry;                      // 질문 + (있다면) 기존 답변
  onBack: () => void;                   // 목록으로
  onSave: (title: string, content: string, files: InquiryFile[], deletedFiles?: InquiryFile[]) => void;  // 저장 콜백 (메인/대회별로 다름)
};

function InquiryDetailPanel({ detail, onBack, onSave }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [answerTitle, setAnswerTitle] = React.useState("");
  const [answerHtml, setAnswerHtml] = React.useState("");
  const [answerFiles, setAnswerFiles] = React.useState<InquiryFile[]>([]);
  const [deletedFiles, setDeletedFiles] = React.useState<InquiryFile[]>([]);
  const [originalFiles, setOriginalFiles] = React.useState<InquiryFile[]>([]);

  // ✅ detail의 id/answer가 바뀔 때만 초기화 (lint 경고 해소)
  React.useEffect(() => {
    if (detail?.answer) {
      setAnswerTitle(detail.answer.title || "");
      setAnswerHtml(detail.answer.content || "");
      const files = detail.answer.files ?? [];
      setAnswerFiles(files);
      setOriginalFiles(files); // 원본 파일 목록 저장
      setDeletedFiles([]); // 삭제된 파일 목록 초기화
    } else {
      setAnswerTitle("");
      setAnswerHtml("");
      setAnswerFiles([]);
      setOriginalFiles([]);
      setDeletedFiles([]);
    }
  }, [detail?.id, detail?.answer]);

  const onClickWrite = () => {
    // 답변이 없을 때만 문의글 제목으로 자동 채우기
    if (!detail.answer && detail.title) {
      setAnswerTitle(detail.title);
    }
    setEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("answer-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // 파일 변경 감지하여 삭제된 파일 추적
  const handleFilesChange = (newFiles: InquiryFile[]) => {
    setAnswerFiles(newFiles);
    
    // 원본 파일에서 현재 파일을 제외한 것들을 삭제된 파일로 간주
    const deleted = originalFiles.filter(originalFile => 
      !newFiles.some(newFile => newFile.id === originalFile.id)
    );
    setDeletedFiles(deleted);
  };

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (isSaving) return; // 중복 저장 방지
    
    // 답변 제목 검증
    if (!answerTitle || answerTitle.trim() === '') {
      alert('답변 제목을 입력해주세요.');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(answerTitle, answerHtml, answerFiles, deletedFiles);
      setEditing(false); // 성공 시 편집 모드 종료
    } catch (_error) {
      // 에러는 상위에서 처리됨
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      {/* 상단 액션 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={onBack}>
            목록으로
          </Button>
          {detail.answer ? (
            <Button size="sm" tone="primary" widthType="pager" onClick={onClickWrite}>
              답변수정
            </Button>
          ) : (
            <Button size="sm" tone="primary" widthType="pager" onClick={onClickWrite}>
              답변하기
            </Button>
          )}
        </div>
      </div>

      {/* 질문 본문 */}
      <article className="rounded-xl border bg-white">
        <header className="px-6 pt-6 pb-2">
          <h1 className="text-xl font-semibold flex items-center">
            {detail.secret && <Lock className="w-5 h-5 text-gray-500 mr-2" />}
            {detail.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            작성자 {detail.author} · 작성일 {detail.date}
          </p>
        </header>
        <div className="h-px bg-gray-100" />
        <div className="px-6 py-6 prose max-w-none">
          {detail.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.content) }} />
          ) : (
            <p className="text-gray-600">내용이 없습니다.</p>
          )}
        </div>
        {detail.files && detail.files.length > 0 && (
          <div className="px-6 pb-6">
            <BoardFileBox variant="view" title="첨부파일" files={detail.files} />
          </div>
        )}
      </article>

      {/* 답변 보기 */}
      {detail.answer && !editing && (
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold mb-2">{detail.answer.title || "답변"}</h2>
          <p className="text-sm text-gray-500 mb-4">
            작성자 {detail.answer.author} · {detail.answer.date}
          </p>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(detail.answer.content) }} />
          {detail.answer.files && detail.answer.files.length > 0 && (
            <div className="mt-4">
              <BoardFileBox variant="view" files={detail.answer.files} />
            </div>
          )}
        </section>
      )}

      {/* 답변 편집 */}
      {editing && (
        <section id="answer-editor" className="rounded-xl border bg-white p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">답변 제목</label>
            <input
              type="text"
              value={answerTitle}
              onChange={(e) => setAnswerTitle(e.target.value)}
              placeholder="답변 제목을 입력하세요"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">답변 내용</label>
            <TextEditor 
              initialContent={answerHtml} 
              onChange={setAnswerHtml} 
              height="360px" 
              imageDomainType="ANSWER"
              placeholder="답변을 작성해주세요..."
            />
          </div>
          <div className="space-y-2">
            <BoardFileBox
              variant="edit"
              title="첨부파일"
              files={answerFiles}
              onChange={handleFilesChange}
              label="첨부파일 업로드"
              maxCount={10}
              maxSizeMB={20}
              totalMaxMB={200}
              multiple
              showQuotaText={false}
            />
            <div className="text-sm text-gray-500 px-1 pt-1">
              <p>• 텍스트 에디터 내 이미지: JPG, PNG (크기 조절 가능)</p>
              <p>• 첨부파일: JPG, PNG, PDF, DOC, XLS, XLSX</p>
              <p>• 첨부파일 이름이 너무 길면 등록이 실패할 수 있습니다</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => setEditing(false)}>
              취소하기
            </Button>
            <Button 
              size="sm" 
              tone="primary" 
              widthType="pager" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

export default React.memo(InquiryDetailPanel);
