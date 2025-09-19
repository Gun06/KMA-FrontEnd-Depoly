'use client';

import { useParams, useRouter } from 'next/navigation';
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { ChevronLeft, Download, Eye } from 'lucide-react';
import { noticeData } from '@/data/notices';

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;
  
  // 실제 데이터에서 해당 ID의 공지사항 찾기
  const noticeDetail = noticeData.find(notice => notice.id === parseInt(noticeId));

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
                <span>조회수: {noticeDetail.views}</span>
              </div>
              
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">작성일:</span>
                <span className="truncate">{formatDate(noticeDetail.date)}</span>
              </div>
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
            <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words">
              <p className="text-gray-700 whitespace-pre-wrap">
                {noticeDetail.title}에 대한 상세 내용입니다.
                
                이 공지사항은 {noticeDetail.category} 카테고리에 속하며, 
                {noticeDetail.author}님이 {noticeDetail.date}에 작성하셨습니다.
                
                현재 조회수는 {noticeDetail.views}회이며, 
                {noticeDetail.attachments > 0 ? `${noticeDetail.attachments}개의 첨부파일` : '첨부파일이 없습니다'}.
                
                {noticeDetail.pinned && '이 공지사항은 고정 공지사항입니다.'}
              </p>
            </div>
          </div>

          {/* 첨부파일 */}
          {noticeDetail.attachments > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
              <div className="space-y-2">
                {Array.from({ length: noticeDetail.attachments }, (_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                      첨부파일_{index + 1}.pdf
                    </span>
                    <button
                      onClick={() => handleDownload('#', `첨부파일_${index + 1}.pdf`)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                  </div>
                ))}
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
