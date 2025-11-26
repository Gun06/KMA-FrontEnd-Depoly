'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { createHomepageQuestion } from '../api/inquiryApi';
import TextEditor from '@/components/common/TextEditor';
import FileUploader from '@/components/common/Upload/FileUploader';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import { ArrowLeft } from 'lucide-react';
import type { UploadItem } from '@/components/common/Upload/types';
import { authService } from '@/services/auth';

export default function InquiryWritePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isSecret, setIsSecret] = useState(true); // 기본값: 비공개

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = authService.getToken();
        const authenticated = !!token;
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 뒤로 가기
  const handleGoBack = () => {
    router.back();
  };

  // 로그인 페이지로 이동
  const handleLogin = () => {
    router.push('/login');
  };

  // 성공 모달 닫기
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/notice/inquiry');
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
    
    // content 길이 제한 (DB 컬럼 크기 고려)
    if (content.length > 10000) {
      alert('내용이 너무 깁니다. 10,000자 이하로 작성해주세요.');
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
      // FormData 구성 (서버가 multipart/form-data만 지원)
      const formData = new FormData();
      
      // request 객체를 JSON 문자열로 추가
      const requestData = {
        title: title.trim(),
        content: content.trim(),
        secret: isSecret
      };
      
      // JSON 문자열로 전송
      formData.append('request', JSON.stringify(requestData));
      
      // 서버에서 JSON 파싱이 안될 경우를 대비해 개별 필드도 추가
      formData.append('title', requestData.title);
      formData.append('content', requestData.content);
      formData.append('secret', requestData.secret.toString());
      
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

      // API 호출
      const response = await createHomepageQuestion(formData);
      
      if (response.result === 'SUCCESS') {
        setShowSuccessModal(true);
      } else {
        alert('문의사항 등록에 실패했습니다.');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('로그인이 필요')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
          router.push('/login');
        } else {
          alert(`저장 중 오류가 발생했습니다: ${err.message}`);
        }
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항 작성"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-4 text-gray-600">로딩 중...</span>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항 작성"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">로그인이 필요합니다.</p>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "문의사항 작성"
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

              {/* 공개여부 선택 */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
                    공개여부
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="secret"
                        value="false"
                        checked={!isSecret}
                        onChange={() => setIsSecret(false)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">공개</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="secret"
                        value="true"
                        checked={isSecret}
                        onChange={() => setIsSecret(true)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">비공개</span>
                    </label>
                  </div>
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
                  imageDomainType="QUESTION"
                  imageServerType="user"
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
              <li>• 문의사항과 관련된 내용만 작성해주세요.</li>
              <li>• 답변은 보통 1-2일 내에 등록됩니다.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="등록되었습니다!"
        message="문의사항이 성공적으로 등록되었습니다."
      />
    </SubmenuLayout>
  );
}

