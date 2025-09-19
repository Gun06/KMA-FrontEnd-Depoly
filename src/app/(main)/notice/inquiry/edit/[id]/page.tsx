'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SubmenuLayout from '@/layouts/main/SubmenuLayout/SubmenuLayout';
import { getMainInquiryDetail, createMainInquiry, deleteMainInquiry } from '@/data/inquiry/main';
import type { Inquiry } from '@/data/inquiry/types';
import TextEditor from '@/components/common/TextEditor';
import FileUploader from '@/components/common/Upload/FileUploader';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { UploadItem } from '@/components/common/Upload/types';

export default function InquiryEditPage() {
  const router = useRouter();
  const params = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [files, setFiles] = useState<UploadItem[]>([]);

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
          setTitle(data.title);
          setContent(data.content || '');
          setAuthor(data.author);
          
          // 기존 첨부파일을 UploadItem 형태로 변환
          if (data.files && data.files.length > 0) {
            const uploadItems: UploadItem[] = data.files.map((file, index) => ({
              id: file.id.toString(),
              name: file.name,
              size: file.sizeMB * 1024 * 1024, // MB를 bytes로 변환
              sizeMB: file.sizeMB,
              tooLarge: false,
              file: new File([], file.name), // 빈 File 객체 생성
              url: file.url || '#'
            }));
            setFiles(uploadItems);
          }
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

  // 뒤로 가기
  const handleGoBack = () => {
    router.back();
  };

  // 글쓰기 제출
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    if (!author.trim()) {
      alert('작성자명을 입력해주세요.');
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
      // 기존 문의사항 삭제
      if (inquiryId) {
        deleteMainInquiry(inquiryId);
      }

      // 새 문의사항 생성
      createMainInquiry({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        files: files.map((file, index) => ({
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          sizeMB: file.size / (1024 * 1024),
          mime: file.file?.type || 'application/octet-stream',
          url: file.file ? URL.createObjectURL(file.file) : (file as any).url || '#'
        }))
      });

      alert('문의사항이 수정되었습니다.');
      router.push('/notice/inquiry');
    } catch (err) {
      console.error('Error saving inquiry:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!inquiryId) return;
    
    try {
      deleteMainInquiry(inquiryId);
      alert('문의사항이 삭제되었습니다.');
      router.push('/notice/inquiry');
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항 수정"
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
          subMenu: "문의사항 수정"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-red-500 text-base sm:text-lg mb-2">{error}</div>
            <button 
              onClick={handleGoBack}
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
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                삭제
              </button>
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
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </div>

          {/* 수정 폼 */}
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

              {/* 작성자 입력 영역 */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
                    작성자
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="작성자명을 입력해주세요."
                    className="flex-1 h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* 텍스트에디터 */}
              <div className="mb-6">
                <TextEditor
                  initialContent={content || "<p></p>"}
                  height="600px"
                  onChange={setContent}
                  showFormatting={true}
                  showFontSize={true}
                  showTextColor={true}
                  showImageUpload={true}
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
            <h3 className="text-sm font-medium text-blue-800 mb-2">문의사항 수정 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 문의사항을 수정하면 기존 답변이 삭제될 수 있습니다.</li>
              <li>• 개인정보가 포함된 내용은 작성하지 마세요.</li>
              <li>• 문의사항과 관련된 내용만 작성해주세요.</li>
              <li>• 수정 후 관리자 검토를 거쳐 답변이 등록됩니다.</li>
            </ul>
          </div>
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