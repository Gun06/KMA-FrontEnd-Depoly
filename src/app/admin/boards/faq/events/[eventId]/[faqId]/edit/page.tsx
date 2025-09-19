"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/common/Button/Button";
import TextField from "@/components/common/TextField/TextField";
import TextEditor from "@/components/common/TextEditor/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import type { FaqFile } from "@/data/faq/types";
import { getEventFaqDetail, updateEventFaq } from "@/data/faq/event";

export default function Page() {
  const { eventId, faqId } = useParams<{ eventId: string; faqId: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [answerContent, setAnswerContent] = useState("");
  const [answerFiles, setAnswerFiles] = useState<FaqFile[]>([]); // ✅ 답변 첨부 상태
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const it = getEventFaqDetail(String(eventId), Number(faqId));
    if (it) {
      setTitle(it.title || "");
      setQuestionContent(it.question || "");
      setAnswerContent(it.answer?.content || "");
      setAnswerFiles(it.answer?.files ?? []); // ✅ 기존 첨부 불러오기
    }
  }, [eventId, faqId]);

  const handleSave = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    setIsLoading(true);
    try {
      updateEventFaq(
        String(eventId),
        Number(faqId),
        {
          title: title.trim(),
          question: questionContent,
          answer: {
            content: answerContent,
            files: answerFiles, // ✅ 저장 payload에 포함
          },
        },
        { adminName: "관리자" }
      );
      alert("수정되었습니다.");
      router.push(`/admin/boards/faq/events/${eventId}/${faqId}`); // 수정 후 상세로
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || questionContent || answerContent || answerFiles.length) {
      if (!confirm("작성 중인 내용이 있습니다. 취소할까요?")) return;
    }
    router.back();
  };

  return (
    <div className="flex p-6 flex-col gap-6 mx-20">
      <div className="flex justify-end gap-3">
        <Button tone="dark" size="sm" widthType="pager" onClick={handleCancel} disabled={isLoading}>
          취소하기
        </Button>
        <Button tone="primary" variant="solid" size="sm" widthType="pager" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "저장 중..." : "수정하기"}
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 rounded-lg shadow-sm">
          <div className="mb-6 gap-4 flex flex-col">
            {/* 제목 */}
            <div className="flex gap-4">
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center"><p>FAQ</p></div>
              <div className="flex-1">
                <TextField
                  type="text"
                  placeholder="제목을 입력하세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="!h-12 flex-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 질문 */}
            <div className="flex gap-4">
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center"><p>질문</p></div>
              <div className="flex-1">
                <TextEditor
                  height="200px"
                  initialContent={questionContent || "<p></p>"}
                  showFormatting
                  showFontSize
                  showTextColor
                  showImageUpload
                  onChange={setQuestionContent}
                />
              </div>
            </div>

            {/* 답변 */}
            <div className="flex gap-4">
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center"><p>답변</p></div>
              <div className="flex-1 space-y-4">
                <TextEditor
                  height="300px"
                  initialContent={answerContent || "<p></p>"}
                  showFormatting
                  showFontSize
                  showTextColor
                  showImageUpload
                  onChange={setAnswerContent}
                />
                {/* ✅ 답변 첨부 업로더 (저장 연동됨) */}
                <BoardFileBox
                  variant="edit"
                  title="첨부파일"
                  files={answerFiles}
                  onChange={setAnswerFiles}
                  label="첨부파일 업로드"
                  maxCount={10}
                  maxSizeMB={20}
                  totalMaxMB={200}
                  multiple
                  showQuotaText={false}
                />
              </div>
            </div>
          </div>

          <div className="h-px mb-4 bg-gray-200 w-full" />
        </div>
      </div>
    </div>
  );
}
