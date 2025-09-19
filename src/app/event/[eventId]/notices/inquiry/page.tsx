"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { NoticeBoard } from '@/components/common/Notice';
import { getAccessToken, isTokenValid, decodeToken } from '@/utils/jwt';

import { ChevronDown } from 'lucide-react';
import type { NoticeItem as TableNoticeItem } from '@/components/common/Table/types';
import { fetchInquiryList, type InquiryResponse, type InquiryItem } from './api/inquiryApi';
import { formatDate, maskAuthorName } from './utils/formatters';
import { SecretPostModal } from './components/SecretPostModal';

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
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState('title');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  
  const searchOptions = [
    { value: 'title', label: '제목' },
    { value: 'author', label: '작성자' },
    { value: 'content', label: '내용' },
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

        const data = await fetchInquiryList(eventId, currentPage, pageSize);
        
        // API 응답 데이터 유효성 검사
        if (data && typeof data === 'object' && Array.isArray(data.content)) {
          setInquiryData(data);
          setError(null);
        } else {
          setError('API 응답 데이터 구조가 올바르지 않습니다.');
          setInquiryData(null);
        }
      } catch (error) {
        console.error('❌ 문의사항 목록 조회 중 오류:', error);
        const errorMessage = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
        setError(errorMessage);
        setInquiryData(null);
        
        // 로그인 관련 오류인 경우 리다이렉트
        if (errorMessage.includes('로그인')) {
          setTimeout(() => {
            router.push(`/event/${eventId}/login`);
          }, 3000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [eventId, currentPage, pageSize]);

  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: string | number) => {
    
    // 답변 항목인지 확인 (answer_ prefix가 있는지)
    const idString = String(id);
    
    // 비밀글 권한 체크
    if (inquiryData?.content) {
      const inquiry = inquiryData.content.find(item => 
        item.questionHeader.id === idString || 
        `answer_${item.questionHeader.id}` === idString
      );
      
      if (inquiry) {
        // 문의글인 경우
        if (idString === inquiry.questionHeader.id) {
          if (inquiry.questionHeader.secret && inquiry.questionHeader.authorName !== currentUserId) {
            // 비밀글이고 본인이 아닌 경우 모달 표시
            setIsSecretModalOpen(true);
            return;
          }
        }
        // 답변인 경우
        else if (idString.startsWith('answer_') && inquiry.answerHeader) {
          if (inquiry.questionHeader.secret && inquiry.questionHeader.authorName !== currentUserId) {
            // 원본 문의글이 비밀글이고 본인이 아닌 경우 모달 표시
            setIsSecretModalOpen(true);
            return;
          }
        }
      }
    }
    
    if (idString.startsWith('answer_')) {
      // 답변 ID에서 prefix 제거하고 답변만 보기 위해 answerId 파라미터 추가
      const questionId = idString.replace('answer_', '');
      router.push(`/event/${eventId}/notices/inquiry/particular?id=${questionId}&answerId=${idString}`);
    } else {
      // 질문 항목
      router.push(`/event/${eventId}/notices/inquiry/particular?id=${id}`);
    }
  };

  // 글쓰기 페이지로 이동 (edit 폴더 사용)
  const handleGoToWrite = () => {
    router.push(`/event/${eventId}/notices/inquiry/edit`);
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
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">로딩 중...</div>
            <div className="text-sm text-gray-400">문의사항을 불러오는 중입니다</div>
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
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">문의사항을 불러올 수 없습니다</div>
            <div className="text-sm text-gray-400 mb-4">{error}</div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                다시 시도
              </button>
              {error?.includes('로그인이 필요') && (
                <button
                  onClick={() => router.push(`/event/${eventId}/login`)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  로그인하기
                </button>
              )}
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // API 데이터를 TableNoticeItem 타입으로 변환 (질문 + 답변)
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


        // 질문 항목 추가
        const questionItem: TableNoticeItem = {
          id: inquiry.questionHeader.id as any,
          title: (inquiry.questionHeader.secret && inquiry.questionHeader.authorName !== currentUserId) 
            ? '비밀글입니다.' 
            : inquiry.questionHeader.title,
          author: maskAuthorName(inquiry.questionHeader.authorName, currentUserId),
          date: formatDate(inquiry.questionHeader.createdAt),
          attachments: 0,
          views: 0,
          pinned: false,
          category: '문의' as const
        };
        items.push(questionItem);

        // 답변이 있고, 현재 사용자가 질문 작성자인 경우에만 답변 항목 추가

        if (inquiry.answerHeader && currentUserId && inquiry.questionHeader.authorName === currentUserId) {
          
          const answerItem: TableNoticeItem = {
            id: `answer_${inquiry.questionHeader.id}` as any, // 원본 문의사항 ID 사용
            title: `↳ [RE] ${(inquiry.questionHeader.secret && inquiry.questionHeader.authorName !== currentUserId) 
              ? '비밀글입니다.' 
              : inquiry.questionHeader.title}`,
            author: maskAuthorName(inquiry.answerHeader.authorName, currentUserId),
            date: formatDate(inquiry.answerHeader.createdAt),
            attachments: 0,
            views: 0,
            pinned: false,
            category: '답변' as const
          };
          items.push(answerItem);
        } else if (inquiry.answerHeader && currentUserId && inquiry.questionHeader.authorName !== currentUserId) {
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
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
        subMenu: "문의사항"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        <NoticeBoard
          data={displayInquiries}
          onRowClick={handleRowClick}
          pageSize={10}
          pinLimit={0}
          numberDesc={true}
          showPinnedBadgeInNo={false}
          pinnedClickable={true}
          showSearch={false}
        />
        
        {/* 페이지네이션 밑 검색 영역 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* 카테고리 드롭다운 */}
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
              className="h-10 pl-4 pr-12 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

        {/* 페이지네이션 */}
        {inquiryData && inquiryData.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={inquiryData.first || currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>

              {/* 페이지 번호 표시 로직 개선 */}
              {(() => {
                const totalPages = inquiryData.totalPages;
                const current = currentPage;
                const pages = [];
                
                // 시작 페이지 계산
                let startPage = Math.max(1, current - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                
                // 끝 페이지가 조정되면 시작 페이지도 조정
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 text-sm border rounded-md ${current === i
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                return pages;
              })()}

              <button
                onClick={() => setCurrentPage(Math.min(inquiryData.totalPages, currentPage + 1))}
                disabled={inquiryData.last || currentPage === inquiryData.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
            
            {/* 페이지 정보 표시 */}
            <div className="ml-4 text-sm text-gray-600">
              총 {inquiryData.totalElements}개 중 {inquiryData.numberOfElements}개 표시
            </div>
          </div>
        )}
      </div>
      
      {/* 비밀글 모달 */}
      <SecretPostModal 
        isOpen={isSecretModalOpen}
        onClose={() => setIsSecretModalOpen(false)}
      />
    </SubmenuLayout>
  );
}