'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SubmenuLayout from '@/layouts/main/SubmenuLayout/SubmenuLayout';
import { getMainInquiryDetail, deleteMainInquiry } from '@/data/inquiry/main';
import type { Inquiry } from '@/data/inquiry/types';
import { ChevronLeft, Edit, Trash2, Download, Eye, MessageSquare } from 'lucide-react';

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inquiryId = params?.id ? Number(params.id) : null;

  useEffect(() => {
    if (!inquiryId) {
      setError('잘못된 문의사항 ID입니다.');
      setLoading(false);
      return;
    }

    const fetchInquiry = async () => {
      try {
        const data = getMainInquiryDetail(inquiryId);
        if (!data) {
          setError('문의사항을 찾을 수 없습니다.');
        } else {
          setInquiry(data);
        }
      } catch (err) {
        setError('문의사항을 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching inquiry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId]);

  const handleDelete = () => {
    if (!inquiryId) return;
    
    try {
      deleteMainInquiry(inquiryId);
      router.push('/notice/inquiry');
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    if (!inquiryId) return;
    router.push(`/notice/inquiry/edit/${inquiryId}`);
  };

  const handleBack = () => {
    router.push('/notice/inquiry');
  };

  const formatFileSize = (sizeMB: number) => {
    if (sizeMB < 1) {
      return `${Math.round(sizeMB * 1024)}KB`;
    }
    return `${sizeMB.toFixed(1)}MB`;
  };

  const handleFileDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  if (loading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-gray-500 text-base sm:text-lg">문의사항을 불러오는 중...</div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (error || !inquiry) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-red-500 text-base sm:text-lg mb-2">{error}</div>
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
        subMenu: "문의사항"
      }}
    >
      <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        {/* 상단 버튼 영역 */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>수정</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>삭제</span>
            </button>
          </div>
        </div>

        {/* 문의사항 상세 내용 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
              {inquiry.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">작성자:</span>
                <span className="truncate max-w-[100px] sm:max-w-none">{inquiry.author}</span>
              </div>
              
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span>조회수: {inquiry.views || 0}</span>
              </div>
              
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">작성일:</span>
                <span className="truncate">{formatDate(inquiry.date)}</span>
              </div>
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
            <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words">
              <p className="text-gray-700 whitespace-pre-wrap">
                {inquiry.content || '내용이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 첨부파일 */}
          {inquiry.files && inquiry.files.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
              <div className="space-y-2">
                {inquiry.files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                      {file.name}
                    </span>
                    <button
                      onClick={() => handleFileDownload(file.url || '#', file.name)}
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

          {/* 답변 영역 */}
          {inquiry.answer && (
            <div className="border-t border-gray-200 bg-blue-50">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900">관리자 답변</h3>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="font-medium">답변자:</span>
                      <span className="truncate max-w-[100px] sm:max-w-none">{inquiry.answer.author}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="font-medium">답변일:</span>
                      <span className="truncate">{formatDate(inquiry.answer.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {inquiry.answer.content}
                  </p>
                </div>

                {/* 답변 첨부파일 */}
                {inquiry.answer.files && inquiry.answer.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">답변 첨부파일</h4>
                    <div className="space-y-2">
                      {inquiry.answer.files.map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-white rounded-md border border-blue-200 hover:bg-blue-50 transition-colors gap-3"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                            {file.name}
                          </span>
                          <button
                            onClick={() => handleFileDownload(file.url || '#', file.name)}
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
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            뒤로가기
          </button>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                문의사항 삭제
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                정말로 이 문의사항을 삭제하시겠습니까?<br />
                삭제된 문의사항은 복구할 수 없습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors order-2 sm:order-1"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors order-1 sm:order-2"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SubmenuLayout>
  );
}
