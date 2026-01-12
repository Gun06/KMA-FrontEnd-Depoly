
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { ChevronLeft, Download, Eye } from 'lucide-react';
import { useNoticeDetail } from '../hooks/useNoticeDetail';
import { sanitizeHtml } from '@/utils/sanitize';
import { prepareHtmlForDisplay } from "@/components/common/TextEditor/utils/prepareHtmlForDisplay";

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;
  
  // API에서 공지사항 상세 정보 로드
  const { noticeDetail, loading, error } = useNoticeDetail(noticeId);

  // 읽기 시 HTML 처리 (빈 <p> 태그를 <p><br></p>로 변환하여 개행 표시)
  const displayContent = React.useMemo(() => {
    if (!noticeDetail?.content) return '';
    return prepareHtmlForDisplay(sanitizeHtml(noticeDetail.content));
  }, [noticeDetail?.content]);

  // 뒤로가기 함수
  const handleBack = () => {
    router.push('/notice/notice');
  };

  // 첨부파일 다운로드 함수
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 로딩 상태
  if (loading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "공지사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-4 text-gray-600">공지사항을 불러오는 중...</span>
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
          subMenu: "공지사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-red-600 text-base sm:text-lg mb-2">{error}</div>
            <button
              onClick={handleBack}
              className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 공지사항을 찾을 수 없는 경우
  if (!noticeDetail) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "공지사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-gray-500 text-base sm:text-lg mb-2">공지사항을 찾을 수 없습니다</div>
            <button
              onClick={handleBack}
              className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              목록으로 돌아가기
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
        subMenu: "공지사항"
      }}
    >
      <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>뒤로가기</span>
        </button>

        {/* 공지사항 상세 내용 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
              {noticeDetail.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">작성자:</span>
                <span className="truncate max-w-[100px] sm:max-w-none">{noticeDetail.author}</span>
              </div>
              
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span>조회수: {noticeDetail.viewCount}</span>
              </div>
              
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">작성일:</span>
                <span className="truncate">{formatDate(noticeDetail.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
            <div className="text-sm sm:text-base leading-relaxed">
              {noticeDetail.content ? (
                <div
                  className="text-gray-600 prose max-w-none font-thin [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontWeight: 100,
                    color: '#4b5563'
                  }}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              ) : (
                <p className="text-gray-500">내용이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 첨부파일 */}
          {noticeDetail.attachmentUrls && noticeDetail.attachmentUrls.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
              <div className="space-y-2">
                {noticeDetail.attachmentUrls.map((url, index) => {
                  // URL에서 파일명 추출 (마지막 '/' 이후 부분)
                  const filename = url.split('/').pop() || `첨부파일_${index + 1}`;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                        {filename}
                      </span>
                      <button
                        onClick={() => handleDownload(url, filename)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            뒤로가기
          </button>
        </div>
      </div>
    </SubmenuLayout>
  );
}
