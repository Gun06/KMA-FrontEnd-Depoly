import React, { useState, useEffect } from 'react';
import InquiryTable from './InquiryTable';
import { useInquiryList, useInquiryForm } from './hooks';
import { InquiryItem, InquiryFilter } from './types';

interface InquiryBoardProps {
  title?: string;
  showFilters?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

export default function InquiryBoard({ 
  title = "문의사항", 
  showFilters = true, 
  showPagination = true,
  pageSize = 10 
}: InquiryBoardProps) {
  const { inquiries, loading, error, fetchInquiries, updateInquiryStatus } = useInquiryList();
  const { formData, handleInputChange, resetForm } = useInquiryForm();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<InquiryFilter>({});
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchInquiries(filters);
  }, [fetchInquiries, filters]);

  const handleFilterChange = (newFilters: Partial<InquiryFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (id: string, status: InquiryItem['status']) => {
    await updateInquiryStatus(id, status);
  };

  const handleRowClick = (inquiry: InquiryItem) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 문의사항 생성 로직 구현
    resetForm();
  };

  const totalPages = Math.ceil(inquiries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentInquiries = inquiries.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => setShowDetailModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          새 문의사항
        </button>
      </div>

      {/* 필터 */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="pending">대기중</option>
                <option value="answered">답변완료</option>
                <option value="closed">종료</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="general">일반</option>
                <option value="technical">기술</option>
                <option value="billing">결제</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우선순위
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange({ priority: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow border">
        <InquiryTable
          inquiries={currentInquiries}
          onRowClick={handleRowClick}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      </div>

      {/* 페이지네이션 */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </nav>
        </div>
      )}

      {/* 문의사항 생성 모달 */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedInquiry ? '문의사항 상세' : '새 문의사항'}
              </h3>
              
              {selectedInquiry ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">제목</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">내용</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.content}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작성자</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.author}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상태</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedInquiry.status === 'pending' ? '대기중' : 
                       selectedInquiry.status === 'answered' ? '답변완료' : '종료'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateInquiry} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">제목</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">내용</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="general">일반</option>
                      <option value="technical">기술</option>
                      <option value="billing">결제</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">우선순위</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                  </div>
                </form>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedInquiry(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
                >
                  닫기
                </button>
                {!selectedInquiry && (
                  <button
                    onClick={handleCreateInquiry}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    생성
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
