"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { NoticeBoard } from '@/components/common/Notice';
import { getAccessToken, isTokenValid, decodeToken } from '@/utils/jwt';
import { authService } from '@/services/auth';

import { ChevronDown } from 'lucide-react';
import type { NoticeItem as TableNoticeItem } from '@/components/common/Table/types';
import { fetchInquiryList, type InquiryResponse, type InquiryItem, type SearchTarget } from './api/inquiryApi';
import { formatDate, maskAuthorName } from './utils/formatters';
import { SecretPostModal } from '@/components/common/Modal/SecretPostModal';
import InquirySkeleton from './components/InquirySkeleton';

// 문의사항 상세보기 API 응답 인터페이스
interface AttachmentInfo {
  url: string;
  originName: string;
  originMb: number;
}

interface InquiryDetailResponse {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  attachmentInfoList: AttachmentInfo[];
  secret: boolean;
}

export default function EventInquiryPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [inquiryData, setInquiryData] = useState<InquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState<SearchTarget>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState(''); // 실제 적용된 검색어
  const [appliedSearchType, setAppliedSearchType] = useState<SearchTarget>('ALL'); // 실제 적용된 검색 타입
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const searchOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'TITLE', label: '제목' },
    { value: 'AUTHOR', label: '작성자' },
  ];

  // 현재 로그인한 사용자 ID 가져오기
  const getCurrentUserId = () => {
    const token = getAccessToken();
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token) as { sub?: string; name?: string } | null;
      // name 필드를 우선으로 사용 (API의 authorName과 매칭)
      const userId = decoded?.name || decoded?.sub || null;
      return userId;
    }
    return null;
  };

  useEffect(() => {
    // 현재 사용자 ID 설정
    const userId = getCurrentUserId();
    setCurrentUserId(userId);

    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 페이지당 표시할 개수를 size로 설정하여 백엔드에서 페이지네이션 처리
        const data = await fetchInquiryList(
          eventId, 
          currentPage, // 현재 페이지
          pageSize, // 페이지당 표시할 개수
          appliedSearchKeyword ? appliedSearchType : undefined, // 검색어가 있을 때만 타입 전달
          appliedSearchKeyword || undefined // 빈 문자열 대신 undefined 전달
        );
        
        // API 응답 데이터 유효성 검사
        if (data && typeof data === 'object' && Array.isArray(data.content)) {
          setInquiryData(data);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setError(null);
        } else {
          setError('API 응답 데이터 구조가 올바르지 않습니다.');
          setInquiryData(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [eventId, currentPage, pageSize, appliedSearchType, appliedSearchKeyword]);

  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: string | number) => {
    // 해당 행의 데이터 찾기 (전체 데이터에서 찾기)
    const rowData = displayInquiries.find(item => item.id === id);
    
    if (!rowData) return;
    
      // 답변 항목인지 확인
      if (rowData.originalQuestionId) {
        // 답변 항목인 경우 - 원본 문의글이 비밀글인지 확인
        const inquiry = inquiryData?.content.find(item => 
          item.questionHeader.id === String(rowData.originalQuestionId)
        );
      
      if (inquiry) {
        // 원본 문의글이 비밀글인지 확인
        const isSecret = inquiry.questionHeader.secret;
        const isAuthor = !!(currentUserId && inquiry.questionHeader.authorName === currentUserId);
        const canViewContent = !isSecret || isAuthor;
        
        if (!canViewContent) {
          // 원본 문의글이 비밀글인 경우 - 비밀번호 입력 후 이동
          setSelectedInquiryId(String(rowData.answerHeaderId));
          setIsSecretModalOpen(true);
          return;
        }
      }
      
      // 권한이 있거나 공개 문의글인 경우 - 답변은 항상 공개이므로 바로 이동
      router.push(`/event/${eventId}/notices/inquiry/particular?id=${rowData.originalQuestionId}&answerId=${rowData.answerHeaderId}`);
      return;
    } else {
      // 질문 항목인 경우
      const inquiry = inquiryData?.content.find(item => 
        item.questionHeader.id === String(id)
      );
      
      if (inquiry) {
        // 메인 문의와 동일한 권한 규칙: 비밀글은 작성자만 열람 가능
        const isSecret = inquiry.questionHeader.secret;
        const isAuthor = !!(currentUserId && inquiry.questionHeader.authorName === currentUserId);
        const canViewContent = !isSecret || isAuthor;
        
        if (!canViewContent) {
          // 비밀글인 경우 - 질문 ID를 저장하고 모달 열기
          setSelectedInquiryId(String(id));
          setIsSecretModalOpen(true);
          return;
        }
        
        // 권한이 있는 경우 - 문의사항 상세 페이지로 이동
        router.push(`/event/${eventId}/notices/inquiry/particular?id=${id}`);
        return;
      }
    }
    
    // 기본적으로 문의사항 상세 페이지로 이동 (메인과 동일한 방식)
    router.push(`/event/${eventId}/notices/inquiry/particular?id=${id}`);
  };

  // 글쓰기 페이지로 이동 (write 폴더 사용)
  const handleGoToWrite = () => {
    router.push(`/event/${eventId}/notices/inquiry/write`);
  };

  // 비밀번호 확인 핸들러
  const handlePasswordConfirm = async (password: string) => {
    if (!selectedInquiryId) return;
    
    try {
      setIsPasswordLoading(true);
      
      // 답변인지 질문인지 확인
      const rowData = displayInquiries.find(item => 
        item.id === selectedInquiryId || 
        item.answerHeaderId === selectedInquiryId
      );
      
      // 답변인 경우 원본 문의글 ID로 비밀번호 검증
      const questionIdForValidation = rowData?.originalQuestionId || selectedInquiryId;
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${questionIdForValidation}`;

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password: password 
        }),
      });


      if (response.ok) {
        // 비밀번호가 맞으면 상세 페이지로 이동
        if (rowData?.originalQuestionId) {
          // 답변인 경우 - 현재 페이지로 이동하면서 answerId와 password 전달
          router.push(`/event/${eventId}/notices/inquiry/particular?id=${rowData.originalQuestionId}&answerId=${selectedInquiryId}&password=${encodeURIComponent(password)}`);
        } else {
          // 질문인 경우 - 비밀번호를 URL 파라미터로 전달
          router.push(`/event/${eventId}/notices/inquiry/particular?id=${selectedInquiryId}&password=${encodeURIComponent(password)}`);
        }
        
        setIsSecretModalOpen(false);
        setSelectedInquiryId(null);
      } else {
        // 비밀번호가 틀리면 에러 메시지 표시 (모달 내에서 처리)
        throw new Error('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      // 에러를 다시 throw하여 모달에서 처리하도록 함
      throw error;
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // 비밀글 모달 닫기
  const handleSecretModalClose = () => {
    setIsSecretModalOpen(false);
    setSelectedInquiryId(null);
  };

  // 검색 핸들러
  const handleSearch = () => {
    setAppliedSearchKeyword(searchKeyword);
    setAppliedSearchType(selectedSearchType);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    // useEffect에서 자동으로 검색 실행됨
  };

  // 검색어 입력 핸들러
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 검색 타입 변경 핸들러
  const handleSearchTypeChange = (type: SearchTarget) => {
    setSelectedSearchType(type);
    setCurrentPage(1); // 검색 타입 변경 시 첫 페이지로 이동
  };

  // 검색어 초기화
  const handleSearchReset = () => {
    setSearchKeyword('');
    setSelectedSearchType('ALL');
    setAppliedSearchKeyword('');
    setAppliedSearchType('ALL');
    setCurrentPage(1);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          {/* 안내문구 */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-700 text-sm leading-relaxed">
                대회 관련 문의사항을 남겨주시면 빠른 시간 내에 답변드리겠습니다. 
                문의하실 때는 구체적인 내용을 작성해 주시기 바라며, 
                비밀글 설정 시 비밀번호를 잊지 않도록 주의해 주세요.
              </p>
            </div>
          </div>

          {/* 스켈레톤 UI */}
          <InquirySkeleton />
          
          {/* 검색 영역 - 로딩 중에도 표시 */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* 카테고리 드롭다운 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-32 h-10 px-2 border border-[#58616A] rounded-[5px] text-sm bg-white focus:border-[#256EF4] outline-none flex items-center justify-between"
              >
                <span className="text-[15px] leading-[26px] text-[#1E2124]">
                  {searchOptions.find(opt => opt.value === selectedSearchType)?.label || '전체'}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#33363D] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <>
                  {/* 백드롭 */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  {/* 드롭다운 메뉴 */}
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#CDD1D5] rounded-md shadow-lg z-20 py-1">
                    {searchOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          handleSearchTypeChange(option.value as SearchTarget);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          selectedSearchType === option.value ? 'bg-[#EEF2F7]' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* 검색 입력창 */}
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={handleKeywordChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="검색어를 입력하세요"
                className="h-10 pl-4 pr-12 border border-gray-300 rounded-md text-sm w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {/* 검색 초기화 버튼 */}
            {(appliedSearchKeyword || appliedSearchType !== 'ALL') && (
              <button
                onClick={handleSearchReset}
                className="h-10 px-4 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors whitespace-nowrap"
              >
                초기화
              </button>
            )}

            {/* 글쓰기 버튼 */}
            <button 
              onClick={handleGoToWrite}
              className="h-10 px-6 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              글쓰기
            </button>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 오류 상태
  if (error && !inquiryData) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">오류가 발생했습니다</div>
              <div className="text-sm text-gray-400 break-words">{error}</div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  새로고침
                </button>
                {error?.includes('로그인이 필요') && (
                  <button
                    onClick={() => router.push(`/event/${eventId}/login`)}
                    className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    로그인하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // API 데이터를 TableNoticeItem 타입으로 변환 (질문 + 답변 표시, 답변은 번호 없음)
  const displayInquiries: TableNoticeItem[] = (() => {
    if (inquiryData && inquiryData.content && inquiryData.content.length > 0) {
      const items: TableNoticeItem[] = [];
      
      inquiryData.content.forEach((inquiry: InquiryItem) => {
        // 날짜 포맷팅 (ISO 8601 -> YYYY-MM-DD)
        const formatDate = (dateString: string) => {
          try {
            return new Date(dateString).toISOString().split('T')[0];
          } catch (error) {
            return '2025-01-01';
          }
        };
        
        // 질문 항목 추가 - 백엔드에서 받은 no 사용
        const questionItem: TableNoticeItem = {
          id: inquiry.questionHeader.id,
          title: inquiry.questionHeader.title,
          author: maskAuthorName(inquiry.questionHeader.authorName, currentUserId),
          date: formatDate(inquiry.questionHeader.createdAt),
          attachments: 0, // 첨부파일 개수 (기본값 0)
          views: 0,
          pinned: false,
          category: '문의' as const,
          secret: inquiry.questionHeader.secret && !(currentUserId && inquiry.questionHeader.authorName === currentUserId),
          __displayNo: inquiry.questionHeader.no, // 백엔드에서 받은 no 사용
          answered: inquiry.questionHeader.answered, // 답변 여부
        };
        items.push(questionItem);

        // 답변이 있는 경우 답변 항목도 추가 - 번호는 표시하지 않음
        if (inquiry.answerHeader) {
          const answerItem: TableNoticeItem = {
            id: `answer-${inquiry.questionHeader.id}`, // 답변 행의 ID는 고유하게 생성
            title: inquiry.answerHeader.title || '답변',
            author: maskAuthorName(inquiry.answerHeader.authorName, currentUserId),
            date: formatDate(inquiry.answerHeader.createdAt),
            attachments: 0, // 첨부파일 개수 (기본값 0)
            views: 0,
            pinned: false,
            category: '답변' as const,
            secret: false, // 답변은 항상 공개 (비밀번호 요구 안함)
            originalQuestionId: inquiry.questionHeader.id, // 원본 문의 ID 저장 (string으로 유지)
            answerHeaderId: inquiry.answerHeader.id, // 답변 헤더 ID 저장
            __displayNo: undefined, // 답변 행은 번호 숨김
          };
          items.push(answerItem);
        }
      });

      return items;
    } else {
      return [];
    }
  })();


  // 빈 데이터 상태 처리
  if (!isLoading && !error && displayInquiries.length === 0) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              {appliedSearchKeyword || appliedSearchType !== 'ALL' 
                ? '검색 결과가 없습니다' 
                : '등록된 문의사항이 없습니다'
              }
            </div>
            <div className="text-sm text-gray-400 mb-4">
              {appliedSearchKeyword 
                ? '다른 검색어로 시도해보세요' 
                : '첫 번째 문의사항을 작성해보세요'
              }
            </div>
            <div className="flex gap-3 justify-center">
              {appliedSearchKeyword && (
                <button
                  onClick={handleSearchReset}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  검색 초기화
                </button>
              )}
              <button 
                onClick={handleGoToWrite}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                문의사항 작성하기
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
        subMenu: "문의사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        {/* 안내문구 */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-700 text-sm leading-relaxed">
              대회 관련 문의사항을 남겨주시면 빠른 시간 내에 답변드리겠습니다. 
              문의하실 때는 구체적인 내용을 작성해 주시기 바라며, 
              비밀글 설정 시 비밀번호를 잊지 않도록 주의해 주세요.
            </p>
          </div>
        </div>

        {/* 문의사항 목록 - NoticeBoard 내장 페이지네이션 사용 */}
        <NoticeBoard
          data={displayInquiries}
          onRowClick={(id) => handleRowClick(id)}
          showSearch={false}
          currentPage={currentPage}
          totalElements={totalElements}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
        
        {/* 검색 영역 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* 카테고리 드롭다운 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-32 h-10 px-2 border border-[#58616A] rounded-[5px] text-sm bg-white focus:border-[#256EF4] outline-none flex items-center justify-between"
            >
              <span className="text-[15px] leading-[26px] text-[#1E2124]">
                {searchOptions.find(opt => opt.value === selectedSearchType)?.label || '전체'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#33363D] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                {/* 백드롭 */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                {/* 드롭다운 메뉴 */}
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#CDD1D5] rounded-md shadow-lg z-20 py-1">
                  {searchOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleSearchTypeChange(option.value as SearchTarget);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        selectedSearchType === option.value ? 'bg-[#EEF2F7]' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* 검색 입력창 */}
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={handleKeywordChange}
               onKeyPress={(e) => {
                 if (e.key === 'Enter') {
                   e.preventDefault();
                   handleSearch();
                 }
               }}
              placeholder="검색어를 입력하세요"
              className="h-10 pl-4 pr-12 border border-gray-300 rounded-md text-sm w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* 검색 초기화 버튼 */}
          {(appliedSearchKeyword || appliedSearchType !== 'ALL') && (
            <button
              onClick={handleSearchReset}
              className="h-10 px-4 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors whitespace-nowrap"
            >
              초기화
            </button>
          )}

          {/* 글쓰기 버튼 */}
          <button 
            onClick={handleGoToWrite}
            className="h-10 px-6 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            글쓰기
          </button>
        </div>

      </div>
      
      {/* 로그인 필요 모달 제거 (비회원 작성 허용) */}
      
      {/* 비밀글 모달 */}
      <SecretPostModal 
        isOpen={isSecretModalOpen}
        onClose={handleSecretModalClose}
        onConfirm={handlePasswordConfirm}
        isLoading={isPasswordLoading}
      />
    </SubmenuLayout>
  );
}