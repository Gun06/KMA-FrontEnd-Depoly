import { useState, useEffect } from 'react';
import { fetchNoticeDetail, NoticeDetailResponse } from '../api/noticeApi';

export const useNoticeDetail = (noticeId: string) => {
  const [noticeDetail, setNoticeDetail] = useState<NoticeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNoticeDetail = async () => {
      if (!noticeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response: NoticeDetailResponse = await fetchNoticeDetail(noticeId);
        setNoticeDetail(response);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '공지사항을 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadNoticeDetail();
  }, [noticeId]);

  return {
    noticeDetail,
    loading,
    error
  };
};
