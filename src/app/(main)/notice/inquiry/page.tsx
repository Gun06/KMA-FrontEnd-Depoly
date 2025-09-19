'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { NoticeBoard } from '@/components/common/Notice';
import { ChevronDown } from 'lucide-react';
import type { NoticeItem as TableNoticeItem } from '@/components/common/Table/types';
import { getMainInquiries } from '@/data/inquiry/main';

export default function InquiryPage() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchOptions = [
    { value: 'title', label: '제목' },
    { value: 'author', label: '작성자' },
    { value: 'content', label: '내용' },
  ];

  // 문의사항 데이터 가져오기 (NoticeBoard에서 페이지네이션 처리)
  const inquiryData = getMainInquiries(1, 1000, {
    q: searchQuery,
    searchMode: selectedSearchType === 'author' ? 'name' : 'post',
    sort: 'new'
  });

  // 행 클릭 시 처리 (상세 페이지로 이동)
  const handleRowClick = (id: string | number) => {
    console.log('🖱️ 문의사항 클릭:', {
      clickedId: id,
      idType: typeof id,
      targetUrl: `/notice/inquiry/${id}`
    });
    
    // 답변 항목인지 확인 (answer_ prefix가 있는지)
    const idString = String(id);
    if (idString.startsWith('answer_')) {
      // 답변 ID에서 prefix 제거하고 원본 문의사항 ID로 이동
      const originalId = idString.replace('answer_', '');
      router.push(`/notice/inquiry/${originalId}`);
    } else {
      // 질문 항목
      router.push(`/notice/inquiry/${id}`);
    }
  };

  // 글쓰기 페이지로 이동
  const handleGoToWrite = () => {
    router.push('/notice/inquiry/write');
  };

  // 검색 처리
  const handleSearch = () => {
    // 검색 시 데이터 새로고침
  };

  // API 데이터를 TableNoticeItem 타입으로 변환 (질문 + 답변)
  const displayInquiries: TableNoticeItem[] = (() => {
    if (inquiryData && inquiryData.rows && inquiryData.rows.length > 0) {
      const items: TableNoticeItem[] = [];
      
      inquiryData.rows.forEach((inquiry) => {
        // 질문 항목 추가
        const questionItem: TableNoticeItem = {
          id: inquiry.id,
          title: inquiry.title,
          author: inquiry.author,
          date: inquiry.date,
          attachments: inquiry.files?.length || 0,
          views: inquiry.views || 0,
          pinned: false,
          category: '문의' as const
        };
        items.push(questionItem);

        // 답변이 있으면 답변 항목도 추가
        if (inquiry.answer) {
          const answerItem: TableNoticeItem = {
            id: `answer_${inquiry.id}` as any, // 답변 ID 생성
            title: `↳ [RE] ${inquiry.title}`,
            author: inquiry.answer.author,
            date: inquiry.answer.date,
            attachments: inquiry.answer.files?.length || 0,
            views: 0,
            pinned: false,
            category: '답변' as const // 답변 카테고리로 표시
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
  if (displayInquiries.length === 0) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
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
      breadcrumb={{
        mainMenu: "게시판",
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
    </SubmenuLayout>
  );
}
