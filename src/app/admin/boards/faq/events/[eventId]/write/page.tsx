'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button/Button';
import TextEditor from '@/components/common/TextEditor/TextEditor';
import type { Editor } from '@tiptap/react';
import { useCreateEventFaq, faqKeys } from '@/hooks/useFaqs';

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [questionContent, setQuestionContent] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const questionEditorRef = useRef<Editor | null>(null);
  const answerEditorRef = useRef<Editor | null>(null);

  const createEventFaqMutation = useCreateEventFaq();

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
      finalQuestionContent = questionEditorRef.current.getHTML();
    }
    if (answerEditorRef.current) {
      finalAnswerContent = answerEditorRef.current.getHTML();
    }

    // 내용 검증: HTML 태그 제거 후 실제 텍스트가 있는지 확인
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = finalQuestionContent || '';
    const questionText = tempDiv.textContent || tempDiv.innerText || '';
    
    tempDiv.innerHTML = finalAnswerContent || '';
    const answerText = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!questionText.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }
    if (!answerText.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      // FormData 생성
      const formData = new FormData();

      // FAQ 생성 요청 데이터 (HTML 그대로 저장)
      const faqRequest = {
        problem: finalQuestionContent,
        solution: finalAnswerContent
      };
      
      formData.append('faqRequest', JSON.stringify(faqRequest));

      const result = await createEventFaqMutation.mutateAsync({
        eventId: String(eventId),
        formData
      });

      // 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: faqKeys.event(eventId!) });
      
      // 즉시 상세 페이지로 이동
      router.replace(`/admin/boards/faq/events/${eventId}/${result.id}`);
      
      // 이동 후 성공 메시지 표시
      setTimeout(() => {
        alert('FAQ가 성공적으로 저장되었습니다!');
      }, 100);
    } catch (error) {
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (questionContent || answerContent) {
      if (!confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) return;
    }
    router.replace(`/admin/boards/faq/events/${eventId}`);
  };

  return (
    <div className="flex p-6 flex-col gap-6 mx-20">
      {/* 상단 헤더 */}
      <div className="flex justify-end gap-3">
        <Button tone="dark" size="sm" widthType="pager" onClick={handleCancel} disabled={isLoading}>
          취소하기
        </Button>
        <Button tone="primary" variant="solid" size="sm" widthType="pager" onClick={handleSave} disabled={isLoading}>
          {isLoading ? '저장 중...' : '등록하기'}
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 rounded-lg shadow-sm">
          <div className="mb-6 gap-4 flex flex-col">
            {/* 질문 */}
            <div className="flex gap-4">
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center">
                <p>질문</p>
              </div>
              <div className="flex-1">
                <TextEditor
                  showFormatting
                  showFontSize
                  showTextColor
                  showImageUpload={false}
                  height="200px"
                  placeholder="질문 내용을 입력하세요..."
                  onChange={setQuestionContent}
                  onEditorReady={handleQuestionEditorReady}
                />
              </div>
            </div>

            {/* 답변 */}
            <div className="flex gap-4">
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center">
                <p>답변</p>
              </div>
              <div className="flex-1">
                <TextEditor
                  showFormatting
                  showFontSize
                  showTextColor
                  showImageUpload={false}
                  height="300px"
                  placeholder="답변 내용을 입력하세요..."
                  onChange={setAnswerContent}
                  onEditorReady={handleAnswerEditorReady}
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
