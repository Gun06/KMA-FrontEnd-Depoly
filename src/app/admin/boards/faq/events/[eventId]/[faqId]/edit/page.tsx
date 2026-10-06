"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/common/Button/Button";
import {
  BoardDetailPage,
  BoardDetailPlaceholder,
} from "@/components/admin/boards/BoardDetailFrame";
import { BoardFormSaveToolbar } from "@/components/admin/boards/BoardAdminToolbar";
import { FaqFormEditors } from "@/components/admin/boards/faq/FaqFormEditors";
import { compressHtml } from "@/components/common/TextEditor/utils/compressHtml";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import type { Editor } from "@tiptap/react";
import { useFaqDetail, useUpdateFaq, faqKeys } from "@/hooks/useFaqs";

export default function Page() {
  const { eventId, faqId } = useParams<{ eventId: string; faqId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [initialQuestionContent, setInitialQuestionContent] = useState("");
  const [initialAnswerContent, setInitialAnswerContent] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [answerContent, setAnswerContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const questionEditorRef = useRef<Editor | null>(null);
  const answerEditorRef = useRef<Editor | null>(null);

  // API에서 FAQ 상세 정보 가져오기 (임시로 목록에서 찾기)
  const { data: faqDetail, isLoading: detailLoading } = useFaqDetail(faqId);
  const updateFaqMutation = useUpdateFaq();

  useEffect(() => {
    if (faqDetail) {
      // 타입 안전성을 위해 명시적 캐스팅
      const typedFaqDetail = faqDetail as {
        id: string;
        problem: string;
        solution: string;
        eventId: string;
        attachmentUrls?: string[];
      };

      setInitialQuestionContent(typedFaqDetail.problem);
      setInitialAnswerContent(typedFaqDetail.solution);
      setQuestionContent(typedFaqDetail.problem);
      setAnswerContent(typedFaqDetail.solution);
    }
  }, [faqDetail]);

  // 에디터 준비 완료 시 호출
  const handleQuestionEditorReady = (editor: Editor | null) => {
    questionEditorRef.current = editor;
  };

  const handleAnswerEditorReady = (editor: Editor | null) => {
    answerEditorRef.current = editor;
  };

  const handleSave = async () => {
    // 저장 시 에디터에서 최신 HTML 가져오기 (작성한 대로 그대로 저장)
    let finalQuestionContent = questionContent;
    let finalAnswerContent = answerContent;
    
    if (questionEditorRef.current) {
      finalQuestionContent = compressHtml(questionEditorRef.current.getHTML(), false);
    }
    if (answerEditorRef.current) {
      finalAnswerContent = compressHtml(answerEditorRef.current.getHTML(), false);
    }

    // 내용 검증: HTML 태그 제거 후 실제 텍스트가 있는지 확인
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = finalQuestionContent || '';
    const questionText = tempDiv.textContent || tempDiv.innerText || '';
    
    tempDiv.innerHTML = finalAnswerContent || '';
    const answerText = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!questionText.trim()) {
      setErrorMessage("질문을 입력해주세요.");
      setShowErrorModal(true);
      return;
    }
    if (!answerText.trim()) {
      setErrorMessage("답변을 입력해주세요.");
      setShowErrorModal(true);
      return;
    }
    
    setIsLoading(true);
    try {
      // FormData 생성
      const formData = new FormData();
      
      // FAQ 수정 요청 데이터 (HTML 그대로 저장)
      const faqUpdate = {
        problem: finalQuestionContent,
        solution: finalAnswerContent,
        deleteFileUrls: [] // 삭제할 파일 URL (필요시 구현)
      };
      
      formData.append('faqUpdate', JSON.stringify(faqUpdate));

      await updateFaqMutation.mutateAsync({
        faqId,
        formData
      });

      // 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: faqKeys.event(eventId!) });

      // 성공 모달 표시
      setShowSuccessModal(true);
    } catch (_error) {
      setErrorMessage("FAQ 수정에 실패했습니다.\n다시 시도해주세요.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (questionContent || answerContent) {
      if (!confirm("작성 중인 내용이 있습니다. 취소할까요?")) return;
    }
    router.back();
  };

  // 로딩 상태 처리
  if (detailLoading) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder>FAQ 정보를 불러오는 중...</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }

  return (
    <>
      <BoardDetailPage>
        <FaqFormEditors
          cardTitle="FAQ 수정"
          titleAction={
            <BoardFormSaveToolbar
              onCancel={handleCancel}
              onSave={handleSave}
              pending={isLoading}
              pendingLabel="저장 중..."
            />
          }
          questionKey={`q-${faqId}`}
          answerKey={`a-${faqId}`}
          initialQuestion={initialQuestionContent}
          initialAnswer={initialAnswerContent}
          onQuestionChange={setQuestionContent}
          onAnswerChange={setAnswerContent}
          onQuestionEditorReady={handleQuestionEditorReady}
          onAnswerEditorReady={handleAnswerEditorReady}
        />
      </BoardDetailPage>

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace(`/admin/boards/faq/events/${eventId}/${faqId}`);
        }}
        title="수정 완료!"
        message="FAQ가 성공적으로 수정되었습니다."
      />

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="오류"
        message={errorMessage}
      />
    </>
  );
}
