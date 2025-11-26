import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEventInquiry } from '../../api/inquiryApi';

interface UseDeleteInquiryProps {
  eventId: string;
  inquiryId: string | null;
  password?: string;
}

export const useDeleteInquiry = ({ eventId, inquiryId, password }: UseDeleteInquiryProps) => {
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
      if (!password) {
        alert('비밀번호가 필요합니다.');
        return;
      }
      
      const response = await deleteEventInquiry(inquiryId, password);
      
      // 삭제 성공 (NO_CONTENTS 또는 SUCCESS 응답)
      if ((typeof response === 'object' && response.result === 'SUCCESS') || 
          (typeof response === 'object' && response.result === 'NO_CONTENTS') || 
          response === 'NO_CONTENTS') {
        setShowDeleteModal(false);
        alert('문의사항이 성공적으로 삭제되었습니다.');
        router.push(`/event/${eventId}/notices/inquiry`);
      } else {
        alert('문의사항 삭제에 실패했습니다.');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('로그인이 필요')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
        } else if (error.message.includes('403')) {
          alert('이 문의사항을 삭제할 권한이 없습니다.');
        } else if (error.message.includes('404')) {
          alert('삭제할 문의사항을 찾을 수 없습니다.');
        } else {
          alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
        }
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
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
