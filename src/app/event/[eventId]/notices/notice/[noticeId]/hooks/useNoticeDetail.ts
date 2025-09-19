import { useState, useEffect } from 'react';
import { fetchNoticeDetail } from '../api/noticeDetailApi';
import { NoticeDetailResponse } from '../types';

export const useNoticeDetail = (noticeId: string) => {
  const [noticeDetail, setNoticeDetail] = useState<NoticeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchNoticeDetail(noticeId);
        setNoticeDetail(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : '공지사항을 불러올 수 없습니다.');
        setNoticeDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (noticeId) {
      fetchData();
    }
  }, [noticeId]);

  return {
    noticeDetail,
    isLoading,
    error
  };
};
