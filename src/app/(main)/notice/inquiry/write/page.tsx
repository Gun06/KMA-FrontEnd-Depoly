'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { createHomepageQuestion, fetchInquiryForEdit, updateHomepageQuestion } from '../api/inquiryApi';
import TextEditor from '@/components/common/TextEditor';
import FileUploader from '@/components/common/Upload/FileUploader';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import { ArrowLeft, Info, Eye, EyeOff } from 'lucide-react';
import type { UploadItem } from '@/components/common/Upload/types';

export default function InquiryWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 수정 모드 확인
  const editId = searchParams.get('editId');
  const editPassword = searchParams.get('password');
  const isEditMode = !!editId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 유효성 검사 함수
  const isPasswordValid = (value: string) => {
    if (!value || value.length < 4) return false;
    if (/\s/.test(value)) return false;
    return true;
  };

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    const loadEditData = async () => {
      if (!isEditMode || !editId || !editPassword) return;
      
      setIsLoadingEditData(true);
      try {
        const editData = await fetchInquiryForEdit(editId, editPassword);
        
        setTitle(editData.title);
        setContent(editData.content);
        setAuthorName(editData.authorName);
        setPassword(editPassword);
        
        // 기존 첨부파일 목록 설정
        if (editData.attachmentInfoList && editData.attachmentInfoList.length > 0) {
          const existingFiles: UploadItem[] = editData.attachmentInfoList.map((file, index) => ({
            id: `existing-${index}`,
            file: null, // 기존 파일은 File 객체가 없음
            name: file.originName,
            size: file.originMb,
            sizeMB: Math.ceil(file.originMb / (1024 * 1024)), // bytes를 MB로 변환
            tooLarge: false, // 기존에 업로드된 파일은 크기 제한 통과
            isExisting: true, // 기존 파일 표시
            url: file.url,
          }));
          setFiles(existingFiles);
        }
      } catch (_error) {
        setErrorMessage('문의사항 데이터를 불러오는데 실패했습니다.');
        setShowErrorModal(true);
        setTimeout(() => {
          router.push(`/notice/inquiry`);
        }, 100);
      } finally {
        setIsLoadingEditData(false);
      }
    };

    loadEditData();
  }, [isEditMode, editId, editPassword, router]);

  // 한글 입력 방지 함수
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 한글 문자 제거
    const filteredValue = value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
    setPassword(filteredValue);
  };

  // 뒤로 가기
  const handleGoBack = () => {
    router.back();
  };

  // 성공 모달 닫기
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/notice/inquiry');
  };

  // 에러 모달 닫기
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // 글쓰기 제출
  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('제목을 입력해주세요.');
      setShowErrorModal(true);
      return;
    }
    if (!content.trim()) {
      setErrorMessage('내용을 입력해주세요.');
      setShowErrorModal(true);
      return;
    }
    if (!authorName.trim()) {
      setErrorMessage('작성자명을 입력해주세요.');
      setShowErrorModal(true);
      return;
    }
    if (!isPasswordValid(password)) {
      setErrorMessage('비밀번호는 4자리 이상 입력해주세요. (공백 불가)');
      setShowErrorModal(true);
      return;
    }
    
    // content 길이 제한 (DB 컬럼 크기 고려)
    if (content.length > 10000) {
      setErrorMessage('내용이 너무 깁니다. 10,000자 이하로 작성해주세요.');
      setShowErrorModal(true);
      return;
    }
    
    // 파일 크기 검사 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setErrorMessage(`파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.\n문제 파일: ${oversizedFiles.map(f => f.name).join(', ')}`);
      setShowErrorModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // FormData 구성 (이벤트와 동일)
      const formData = new FormData();
      
      // request 객체를 JSON 문자열로 추가
      let requestData;
      if (isEditMode) {
        // 수정 모드: patch 구조
        requestData = {
          patch: {
            title: title.trim(),
            content: content.trim(),
            deletedFileUrlList: [], // 파일 삭제는 현재 지원하지 않음
            secret: true // 하드코딩: 항상 비공개
          },
          password: password
        };
      } else {
        // 새 글 작성 모드
        requestData = {
          post: {
            title: title.trim(),
            content: content.trim(),
            secret: true // 하드코딩: 항상 비공개
          },
          nickName: authorName.trim(),
          password: password
        };
      }
      
      formData.append('request', JSON.stringify(requestData));
      
      // 첨부파일들 추가
      files.forEach((file, index) => {
        if (file.file) {
          // 파일명 단순화 (이벤트와 동일)
          const originalName = file.name;
          const extension = originalName.split('.').pop() || '';
          const timestamp = Date.now();
          const simpleName = `file_${timestamp}_${index}.${extension}`;
          
          const renamedFile = new File([file.file], simpleName, {
            type: file.file.type,
            lastModified: file.file.lastModified
          });
          
          formData.append('files', renamedFile);
        }
      });

      // API 호출 (수정 모드인지 확인)
      let response;
      if (isEditMode && editId) {
        response = await updateHomepageQuestion(editId, formData);
      } else {
        response = await createHomepageQuestion(formData);
      }
      
      const isSuccess = typeof response === 'string' 
        ? response === 'SUCCESS' 
        : response.result === 'SUCCESS';
        
      if (isSuccess) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(isEditMode ? '문의사항 수정에 실패했습니다.' : '문의사항 등록에 실패했습니다.');
        setShowErrorModal(true);
      }
    } catch (_err) {
      if (_err instanceof Error) {
        if (_err.message.includes('ALREADY_ANSWERED_QUESTION')) {
          setErrorMessage('답변이 완료된 질문은 수정이 불가능합니다.');
        } else {
          setErrorMessage(`저장 중 오류가 발생했습니다: ${_err.message}`);
        }
      } else {
        setErrorMessage('저장 중 오류가 발생했습니다.');
      }
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  // 로딩 상태 UI (수정 모드)
  if (isLoadingEditData) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: isEditMode ? "문의사항 수정" : "문의사항 작성"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">문의사항 데이터를 불러오는 중...</p>
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
        subMenu: isEditMode ? "문의사항 수정" : "문의사항 작성"
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
                {isSubmitting
                  ? (isEditMode ? '수정 중...' : '등록 중...')
                  : (isEditMode ? '수정하기' : '등록하기')
                }
              </button>
            </div>
          </div>

          {/* 작성 안내문구 */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-gray-700 text-sm leading-relaxed text-left space-y-3">
                <div>
                  <strong>작성 시 주의사항:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>비밀번호 찾기가 지원되지 않습니다.</li>
                    <li>비밀번호는 게시글을 수정하고 삭제하기 위해 필요하오니 분실되지 않도록 주의바랍니다.</li>
                    <li>관리자 답변이 등록된 문의사항은 수정이 불가능합니다.</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-gray-300 space-y-2">
                  <div>
                    <strong>공개글:</strong> 모든 사용자가 볼 수 있으며, 관리자의 답변도 모든 사용자가 볼 수 있습니다.
                  </div>
                  <div>
                    <strong>비공개글:</strong> 작성자와 관리자만 볼 수 있으며, 비밀번호로 본인 확인 후 조회/수정/삭제가 가능합니다.
                  </div>
                  <div className="text-red-600 font-medium">
                    <strong>※ 현재 모든 문의사항은 비공개로만 작성됩니다.</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 작성 폼 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
            {/* 작성자 */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">작성자</label>
                <div className="w-80">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="작성자명을 입력해주세요."
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="mb-6">
              <div className="flex items-start gap-4">
                <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0 mt-2.5">비밀번호</label>
                <div className="w-80">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="비밀번호 (4자리 이상)"
                      className={`w-full h-10 px-3 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        isEditMode
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed focus:ring-gray-300'
                          : password && password.length > 0
                            ? isPasswordValid(password)
                              ? 'border-green-500 focus:ring-green-500'
                              : 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      disabled={isSubmitting || isEditMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isSubmitting}
                      aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* 수정 모드일 때 안내 문구 */}
                  {isEditMode && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ※ 비밀번호는 수정이 불가합니다.
                    </p>
                  )}
                  
                  {/* 비밀번호 유효성 검사 안내 (작성 모드일 때만) */}
                  {!isEditMode && password && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className={`flex items-center text-xs ${
                        password.length >= 4 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          password.length >= 4 ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        길이: 4자리 이상 ({password.length}자)
                      </div>
                      <div className={`flex items-center text-xs ${
                        !/\s/.test(password) ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          !/\s/.test(password) ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        공백 불가
                      </div>
                    </div>
                  )}

                  {!isEditMode && (
                    <p className="text-xs text-gray-500 mt-2">
                      비밀글 조회/수정/삭제 시 필요합니다. (4자리 이상, 공백 불가)
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      공개여부
                    </label>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help flex-shrink-0" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                          현재 모든 문의사항은 비공개로만 작성됩니다
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                      <input
                        type="radio"
                        name="secret"
                        value="false"
                        checked={false}
                        disabled={true}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">공개</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                      <input
                        type="radio"
                        name="secret"
                        value="true"
                        checked={true}
                        disabled={true}
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
                key={isEditMode ? `edit-${editId}` : 'new'}
                initialContent={content || "<p></p>"}
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

          {/* 하단 안내 문구 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">문의사항 작성 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 문의사항은 관리자 검토 후 답변이 등록됩니다.</li>
              <li>• 개인정보가 포함된 내용은 작성하지 마세요.</li>
              <li>• 문의사항과 관련된 내용만 작성해주세요.</li>
              <li>• 답변은 보통 1-2일 내에 등록됩니다.</li>
              <li>• 현재 모든 문의사항은 비공개로만 작성됩니다.</li>
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
              {isSubmitting
                ? (isEditMode ? '수정 중...' : '등록 중...')
                : (isEditMode ? '수정하기' : '등록하기')
              }
            </button>
          </div>
        </div>
      </div>

      {/* 성공 모달 */}
      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={isEditMode ? "수정되었습니다!" : "등록되었습니다!"}
        message={isEditMode ? "문의사항이 성공적으로 수정되었습니다." : "문의사항이 성공적으로 등록되었습니다."}
      />

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        message={errorMessage}
      />
    </SubmenuLayout>
  );
}

