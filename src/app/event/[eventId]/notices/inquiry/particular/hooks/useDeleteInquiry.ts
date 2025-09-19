import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, isTokenValid } from '@/utils/jwt';

interface UseDeleteInquiryProps {
  eventId: string;
  inquiryId: string | null;
}

export const useDeleteInquiry = ({ eventId, inquiryId }: UseDeleteInquiryProps) => {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!inquiryId) {
      alert('삭제할 문의사항 ID가 없습니다.');
      return;
    }

    setIsDeleting(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/question/${inquiryId}`;

      // 인증 토큰 가져오기 및 유효성 검사
      const token = getAccessToken();

      if (!token || !isTokenValid(token)) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });


      if (response.ok) {
        const responseText = await response.text();
        setShowDeleteModal(false);
        alert('문의사항이 성공적으로 삭제되었습니다.');
        router.push(`/event/${eventId}/notices/inquiry`);
      } else {
        const errorText = await response.text();
        console.error('❌ 삭제 실패:', {
          status: response.status,
          errorText
        });
        
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
        } else if (response.status === 403) {
          alert('이 문의사항을 삭제할 권한이 없습니다.');
        } else if (response.status === 404) {
          alert('삭제할 문의사항을 찾을 수 없습니다.');
        } else {
          alert(`삭제 중 오류가 발생했습니다. (${response.status})`);
        }
      }
    } catch (error) {
      console.error('❌ 삭제 네트워크 오류:', error);
      alert(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  return {
    showDeleteModal,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  };
};
