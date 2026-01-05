'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { NoticeBoard } from '@/components/common/Notice';
import { ChevronDown, X, Lock } from 'lucide-react';
import type { NoticeItem as TableNoticeItem } from '@/components/common/Table/types';
import { useInquiryData } from './hooks/useInquiryData';
import { authService } from '@/services/auth';
import { getAccessToken, isTokenValid, decodeToken } from '@/utils/jwt';
import { SecretPostModal } from '@/components/common/Modal/SecretPostModal';
import { verifyQuestionPassword } from './api/inquiryApi';
import InquirySkeleton from './components/InquirySkeleton';

export default function InquiryPage() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchKey, setSearchKey] = useState<'TITLE' | 'AUTHOR'>('TITLE');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // 현재 로그인한 사용자 ID 가져오기 (event 문의사항과 동일한 로직)
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

  // 현재 사용자 ID 설정
  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);
  
  const searchOptions = [
    { value: 'title', label: '제목' },
    { value: 'author', label: '작성자' },
    { value: 'content', label: '내용' },
  ];

  // API에서 문의사항 데이터 로드
  const { inquiryData, loading, error, totalPages, totalElements } = useInquiryData(
    currentPage, 
    12, 
    currentUserId,
    searchKeyword || undefined,
    searchKey
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 핸들러
  const handleSearch = () => {
    // 검색 시 첫 페이지로 이동
    setCurrentPage(1);
    // 검색 키워드와 검색 키 설정
    setSearchKeyword(searchQuery);
    setSearchKey(selectedSearchType === 'author' ? 'AUTHOR' : 'TITLE');
  };

  // 검색 초기화 핸들러
  const handleResetSearch = () => {
    setCurrentPage(1);
    setSearchQuery('');
    setSearchKeyword('');
    setSearchKey('TITLE');
  };

  // 현재 사용자 ID 설정
  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);

    // 행 클릭 시 처리 (상세 페이지로 이동)
    const handleRowClick = (id: string | number) => {
      // 답변 행 ID인지 확인 (answer- 접두사가 있는지)
      const isAnswerRow = typeof id === 'string' && id.startsWith('answer-');
      let originalQuestionId: string | undefined;
      let answerHeaderId: string | undefined;

      if (isAnswerRow) {
        // 답변 행 ID에서 원본 질문 ID 추출
        originalQuestionId = id.replace('answer-', '');

        // 원본 질문 데이터 찾기
        const originalQuestion = inquiryData.find(item => item.id === originalQuestionId);

        if (originalQuestion) {
          answerHeaderId = originalQuestion.answerHeaderId;
          
          // 권한 체크: 직접 계산
          const isSecret = originalQuestion.secret;
          const isAuthor = originalQuestion.isAuthor;
          const canViewContent = !isSecret || isAuthor;
          
          if (!canViewContent) {
            // 비밀번호 입력 모달 표시
            setSelectedInquiryId(String(originalQuestionId));
            setIsSecretModalOpen(true);
            return;
          }
          
          // 답변 상세 페이지로 이동
          if (answerHeaderId) {
            router.push(`/notice/inquiry/answer/${answerHeaderId}?inquiryId=${originalQuestionId}`);
            return;
          }
        }
        return;
      }
      
      // 질문 행인 경우 기존 로직
      const rowData = inquiryData.find(item => item.id === id);
      
      // 권한 체크: 직접 계산 (답변 행과 동일한 로직)
      if (rowData) {
        const isSecret = rowData.secret;
        const isAuthor = rowData.isAuthor;
        const canViewContent = !isSecret || isAuthor;
        
        if (!canViewContent) {
          // 비밀번호 입력 모달 표시
          setSelectedInquiryId(String(id));
          setIsSecretModalOpen(true);
          return;
        }
      }
      
      // 질문 행인 경우 질문 상세 페이지로 이동
      router.push(`/notice/inquiry/particular?id=${rowData?.id}`);
    };

  // 비밀번호 확인 핸들러 (이벤트와 동일)
  const handlePasswordConfirm = async (password: string) => {
    if (!selectedInquiryId) return;
    
    try {
      setIsPasswordLoading(true);
      
      // 비밀번호 검증 API 호출
      await verifyQuestionPassword(selectedInquiryId, password);
      
      // 비밀번호가 맞으면 상세 페이지로 이동
      router.push(`/notice/inquiry/particular?id=${selectedInquiryId}&password=${encodeURIComponent(password)}`);
      setIsSecretModalOpen(false);
      setSelectedInquiryId(null);
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

  // 글쓰기 페이지로 이동 (로그인 체크 제거)
  const handleGoToWrite = () => {
    router.push('/notice/inquiry/write');
  };


  // 로딩 상태
  if (loading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          {/* 안내문구 */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-700 text-sm leading-relaxed">
                전마협 관련 문의사항을 남겨주시면 빠른 시간 내에 답변드리겠습니다. 
                문의하실 때는 구체적인 내용을 작성해 주시기 바라며, 
                비밀글 설정 시 비밀번호를 잊지 않도록 주의해 주세요.
              </p>
            </div>
          </div>

          {/* 스켈레톤 UI */}
          <InquirySkeleton />
          
          {/* 검색 영역 - 로딩 중에도 표시 */}
          <div className="mt-8 flex justify-center px-1 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* 검색 타입 드롭다운 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-32 h-10 px-2 border border-[#58616A] rounded-[5px] text-sm bg-white focus:border-[#256EF4] outline-none flex items-center justify-between"
                >
                  <span className="text-[15px] leading-[26px] text-[#1E2124]">
                    {searchOptions.find(opt => opt.value === selectedSearchType)?.label || '제목'}
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
                            setSelectedSearchType(option.value);
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
                  placeholder="검색어를 입력해주세요."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-10 pl-4 pr-12 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
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
              
              {/* 글쓰기 버튼 */}
              <button 
                onClick={handleGoToWrite}
                className="h-10 px-6 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                글쓰기
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 빈 데이터 상태 처리
  if (inquiryData.length === 0) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          {/* 안내문구 */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-700 text-sm leading-relaxed">
                전마협 관련 문의사항을 남겨주시면 빠른 시간 내에 답변드리겠습니다. 
                문의하실 때는 구체적인 내용을 작성해 주시기 바라며, 
                비밀글 설정 시 비밀번호를 잊지 않도록 주의해 주세요.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">등록된 문의사항이 없습니다</div>
            <div className="text-sm text-gray-400 mb-4">첫 번째 문의사항을 작성해보세요</div>
            <button 
              onClick={handleGoToWrite}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              문의사항 작성하기
            </button>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "문의사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        {/* 안내문구 */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-700 text-sm leading-relaxed">
              전마협 관련 문의사항을 남겨주시면 빠른 시간 내에 답변드리겠습니다. 
              문의하실 때는 구체적인 내용을 작성해 주시기 바라며, 
              비밀글 설정 시 비밀번호를 잊지 않도록 주의해 주세요.
            </p>
          </div>
        </div>

        <NoticeBoard
          data={inquiryData}
          onRowClick={handleRowClick}
          pageSize={12}
          pinLimit={0}
          numberDesc={true}
          currentPage={currentPage}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPinnedBadgeInNo={false}
          pinnedClickable={true}
          showSearch={true}
          useApi={false}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          selectedSearchType={selectedSearchType}
          onSearchTypeChange={setSelectedSearchType}
          onResetSearch={handleResetSearch}
        />
        
        {/* 하단 검색 영역과 글쓰기 버튼 */}
        <div className="mt-8 flex justify-center px-1 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* 검색 타입 드롭다운 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-32 h-10 px-2 border border-[#58616A] rounded-[5px] text-sm bg-white focus:border-[#256EF4] outline-none flex items-center justify-between"
              >
                <span className="text-[15px] leading-[26px] text-[#1E2124]">
                  {searchOptions.find(opt => opt.value === selectedSearchType)?.label || '제목'}
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
                          setSelectedSearchType(option.value);
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
                placeholder="검색어를 입력해주세요."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 pl-4 pr-12 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
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
            
            {/* 글쓰기 버튼 */}
            <button 
              onClick={handleGoToWrite}
              className="h-10 px-6 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              글쓰기
            </button>
          </div>
        </div>

      </div>

      {/* 비밀번호 입력 모달 */}
      <SecretPostModal
        isOpen={isSecretModalOpen}
        onClose={handleSecretModalClose}
        onConfirm={handlePasswordConfirm}
        isLoading={isPasswordLoading}
      />
    </SubmenuLayout>
  );
}




