'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import TextField from '@/components/common/TextField/TextField';
import FileUploader from '@/components/common/Upload/FileUploader';
import SingleImageUploader from '@/components/common/Upload/SingleImageUploader';
import TextEditor from '@/components/common/TextEditor/TextEditor';

export default function Page() {
  const [title, setTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // 초기 데이터 로드 (실제로는 API에서 가져옴)
  useEffect(() => {
    // TODO: 실제 API 호출로 대체
    // const loadFAQData = async () => {
    //   try {
    //     const response = await fetch('/api/faq/edit/123');
    //     const data = await response.json();
    //     setTitle(data.title || '');
    //     setQuestionContent(data.question || '');
    //     setAnswerContent(data.answer || '');
    //   } catch (error) {
    //   }
    // };
    // loadFAQData();
  }, []);

  const handleQuestionChange = (content: string) => {
    setQuestionContent(content);
  };

  const handleAnswerChange = (content: string) => {
    setAnswerContent(content);
  };

  const handleSave = async () => {
    // 입력 검증
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: 실제 API 호출로 대체
      // const response = await fetch('/api/faq', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: title.trim(),
      //     question: questionContent,
      //     answer: answerContent
      //   })
      // });

      // if (!response.ok) throw new Error('저장 실패');
      
      alert('FAQ가 성공적으로 저장되었습니다!');
      
      // 저장 후 초기화 또는 리다이렉트
      // router.push('/admin/boards/faq');
      
    } catch (error) {
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
    // TODO: 이전 페이지로 이동
    // router.back();
  };

  return (
    <div className="flex p-6 flex-col gap-6 mx-20">
      {/* 상단 헤더 */}
      <div className="flex justify-end gap-3">
        <Button 
          tone="dark" 
          size="md" 
          widthType="pager"
          onClick={handleCancel}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button 
          tone="primary" 
          variant="solid" 
          size="md" 
          widthType="pager" 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? '저장 중...' : '등록하기'}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 rounded-lg shadow-sm">
          {/* 제목 및 사용자 정보 */}
          <div className="mb-6 gap-4 flex flex-col">
            <div className="flex gap-4">
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center">
                <p>FAQ</p>
              </div>
              <div className="flex-1">
                <TextField
                  type="text"
                  placeholder="제목을 입력하세요."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="!h-12 flex-1"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              {/* 질문 영역 */} 
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center">
                <p>질문</p>
              </div>
              <div className="flex-1">
                <TextEditor
                  showFormatting={true}
                  showFontSize={true}
                  showTextColor={true}
                  showImageUpload={true}
                  height="200px"
                  initialContent="<p>질문 내용을 입력하세요...</p>"
                  onChange={handleQuestionChange}
                />

              </div>
            </div>
            
            <div className="flex gap-4">
              {/* 답변 영역 */} 
              <div className="bg-zinc-200 rounded-lg p-2 w-[150px] flex items-center justify-center">
                <p>답변</p>
              </div>
              <div className="flex-1">
                <TextEditor
                  showFormatting={true}
                  showFontSize={true}
                  showTextColor={true}
                  showImageUpload={true}
                  height="300px"
                  initialContent="<p>답변 내용을 입력하세요...</p>"
                  onChange={handleAnswerChange}
                />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px mb-4 bg-gray-200 w-full"></div>

          {/* 파일 업로드 섹션 */}
          <div className="space-y-4 mb-6">
            <SingleImageUploader
              label="대표 이미지 업로드"
              maxSizeMB={20}
              onChange={() => {}}
            />
            {/* 구분선 */}
            <div className="h-px mb-4 bg-gray-200 w-full"></div>
            <FileUploader
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              label="첨부파일 업로드"
              maxCount={10}
              maxSizeMB={20}
              multiple
              totalMaxMB={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
