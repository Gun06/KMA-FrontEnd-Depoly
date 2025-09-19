"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import TextEditor from '@/components/common/TextEditor';
import FileUploader from '@/components/common/Upload/FileUploader';
import { ArrowLeft } from 'lucide-react';
import type { UploadItem } from '@/components/common/Upload/types';

// API 응답 타입 정의
interface QuestionCreateResponse {
  id: string;
  result: 'SUCCESS' | 'FAILURE';
}

export default function InquiryEditPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 뒤로 가기
  const handleGoBack = () => {
    router.back();
  };

  // 글쓰기 제출
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    // 파일 크기 검사 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.\n문제 파일: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/event/${eventId}/question`;

      // 인증 토큰 가져오기
      const token = localStorage.getItem('accessToken');

      // FormData 구성 (multipart/form-data)
      const formData = new FormData();
      
      // request 객체를 JSON 문자열로 추가
      const requestData = {
        title: title.trim(),
        content: content.trim(),
        secret: true
      };
      formData.append('request', JSON.stringify(requestData));
      
      // 첨부파일들 추가 (파일명 단순화)
      files.forEach((file, index) => {
        if (file.file) {
          // 파일명을 단순화 (한글 제거, 길이 제한)
          const originalName = file.name;
          const extension = originalName.split('.').pop() || '';
          const timestamp = Date.now();
          const simpleName = `file_${timestamp}_${index}.${extension}`;
          
          // 새로운 파일 객체 생성 (파일명 변경)
          const renamedFile = new File([file.file], simpleName, {
            type: file.file.type,
            lastModified: file.file.lastModified
          });
          
          formData.append('files', renamedFile);
        }
      });


      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });


      if (response.ok) {
        const responseData: QuestionCreateResponse = await response.json();
        
        // 성공 응답 처리
        if (responseData.result === 'SUCCESS') {
          alert(`문의사항이 성공적으로 등록되었습니다. (ID: ${responseData.id})`);
          router.push(`/event/${eventId}/notices/inquiry`);
        } else {
          alert('문의사항 등록에 실패했습니다.');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ 글쓰기 API 호출 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          endpoint: API_ENDPOINT
        });
        console.error('❌ 오류 응답 텍스트:', errorText);
        console.error('❌ 응답 헤더:', Object.fromEntries(response.headers.entries()));
        
        if (response.status === 401) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
        } else if (response.status === 403) {
          alert('해당 이벤트에 문의사항을 작성할 권한이 없습니다.');
        } else if (response.status === 400) {
          alert('입력한 정보를 다시 확인해주세요.');
        } else {
          alert(`문의사항 등록 중 오류가 발생했습니다. (${response.status})`);
        }
      }
    } catch (error) {
      console.error('❌ 글쓰기 네트워크 오류:', error);
      alert(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "문의사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>뒤로</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent'
                }`}
              >
                {isSubmitting ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>

          {/* 작성 폼 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {/* 제목 입력 영역 */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
                    제목
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력해주세요."
                    className="flex-1 h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* 텍스트에디터 */}
              <div className="mb-6">
                <TextEditor
                  initialContent="<p></p>"
                  height="600px"
                  onChange={setContent}
                  showFormatting={true}
                  showFontSize={true}
                  showTextColor={true}
                  showImageUpload={true}
                />
              </div>

              {/* 첨부파일 업로드 */}
              <div className="border-t pt-6">
                <FileUploader
                  label="첨부파일 업로드"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                  maxSizeMB={5}
                  helper="선택된 파일 없음. 최대 10개 / 5MB 이내"
                  multiple={true}
                  maxCount={10}
                  value={files}
                  onChange={setFiles}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">문의사항 작성 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 문의사항은 관리자 검토 후 답변이 등록됩니다.</li>
              <li>• 개인정보가 포함된 내용은 작성하지 마세요.</li>
              <li>• 대회와 관련된 문의사항만 작성해주세요.</li>
              <li>• 답변은 보통 1-2일 내에 등록됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
