"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import TextEditor from '@/components/common/TextEditor';
import FileUploader from '@/components/common/Upload/FileUploader';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import { ArrowLeft } from 'lucide-react';
import type { UploadItem } from '@/components/common/Upload/types';
import { fetchInquiryDetail, updateEventInquiry } from '../api/inquiryApi';
import { authService } from '@/services/auth';

// API 응답 타입 정의
interface _QuestionCreateResponse {
  id: string;
  result: 'SUCCESS' | 'FAILURE';
}

export default function InquiryEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const inquiryId = searchParams.get('id');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [originalFiles, setOriginalFiles] = useState<UploadItem[]>([]); // 원본 파일 목록
  const [isSecret, setIsSecret] = useState(true); // 기본값: 비공개
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = authService.getToken();
        const authenticated = !!token;
        setIsAuthenticated(authenticated);
        } catch (_error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 기존 문의사항 내용 불러오기
  useEffect(() => {
    const loadInquiryDetail = async () => {
      if (!inquiryId) {
        alert('문의사항 ID가 없습니다.');
        router.push(`/event/${eventId}/notices/inquiry`);
        return;
      }

      try {
        setIsLoading(true);
        const detail = await fetchInquiryDetail(eventId, inquiryId);
        
        
        setTitle(detail.title);
        setContent(detail.content);
        setIsSecret(detail.secret);
        
        
        // 첨부파일 처리
        if (detail.attachmentInfoList && detail.attachmentInfoList.length > 0) {
          const existingFiles: UploadItem[] = detail.attachmentInfoList.map((attachment, index) => ({
            id: `existing-${index}`,
            name: attachment.originName,
            size: 0, // 기존 파일의 크기는 알 수 없으므로 0으로 설정
            sizeMB: 0,
            tooLarge: false,
            file: null, // 기존 파일은 File 객체가 없음
            url: attachment.url,
            isExisting: true // 기존 파일임을 표시
          }));
          setFiles(existingFiles);
          setOriginalFiles([...existingFiles]); // 원본 파일 목록 저장
        }
        
        // 작성자 확인 - 실제 사용자 ID와 작성자 ID 비교
        const currentUser = authService.getUserId();
        if (currentUser && detail.author) {
          setIsAuthor(currentUser === detail.author);
        } else {
          setIsAuthor(false);
        }
        
      } catch (_error) {
        alert('문의사항을 불러오는데 실패했습니다.');
        router.push(`/event/${eventId}/notices/inquiry`);
      } finally {
        setIsLoading(false);
      }
    };

    loadInquiryDetail();
  }, [inquiryId, eventId, router]);

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
    router.push(`/event/${eventId}/notices/inquiry`);
  };

  // 수정 제출
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
      if (!inquiryId) {
        alert('문의사항 ID가 없습니다.');
        return;
      }

      // FormData 구성 (multipart/form-data)
      const formData = new FormData();
      
      // 삭제된 파일 URL 목록 계산
      const deletedFileUrls = originalFiles
        .filter(originalFile => !files.some(currentFile => 
          currentFile.isExisting && currentFile.url === originalFile.url
        ))
        .map(file => file.url);

      // request 객체를 JSON 문자열로 추가 (API 스펙에 맞게)
      const requestData = {
        title: title.trim(),
        content: content.trim(),
        secret: isSecret,
        deletedFileUrlList: deletedFileUrls // 삭제된 파일 목록
      };
      formData.append('request', JSON.stringify(requestData));
      
      // 새로 추가된 파일들만 처리
      const newFiles = files.filter(file => file.file && !file.isExisting);
      newFiles.forEach((file, index) => {
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
      const response = await updateEventInquiry(inquiryId, formData);
      
      if (response.result === 'SUCCESS') {
        setShowSuccessModal(true);
      } else {
        alert('문의사항 수정에 실패했습니다.');
      }
      } catch (_err) {
      if (_err instanceof Error) {
        if (_err.message.includes('로그인이 필요')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
          router.push('/login');
        } else if (_err.message.includes('403')) {
          alert('이 문의사항을 수정할 권한이 없습니다.');
        } else if (_err.message.includes('404')) {
          alert('문의사항을 찾을 수 없습니다.');
        } else if (_err.message.includes('500')) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert(`수정 중 오류가 발생했습니다: ${_err.message}`);
        }
      } else {
        alert('수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항 수정"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">문의사항을 불러오는 중...</div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항 수정"
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

  // 작성자가 아닌 경우
  if (!isAuthor) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항 수정"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">권한이 없습니다</div>
              <div className="text-gray-600 mb-4">본인이 작성한 글만 수정할 수 있습니다.</div>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "문의사항 수정"
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
                  initialContent={content}
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
              <li>• 대회와 관련된 문의사항만 작성해주세요.</li>
              <li>• 답변은 보통 1-2일 내에 등록됩니다.</li>
            </ul>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="mt-8 flex items-center justify-center gap-3 pb-8">
            <button
              onClick={handleGoBack}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 transition-colors ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent'
              }`}
            >
              {isSubmitting ? '수정 중...' : '수정하기'}
            </button>
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
