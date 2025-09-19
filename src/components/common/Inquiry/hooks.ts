import { useState, useCallback } from 'react';
import { InquiryItem, InquiryFilter } from './types';

export const useInquiryList = () => {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async (filters?: InquiryFilter) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: 실제 API 호출로 대체
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error('문의사항을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInquiryStatus = useCallback(async (id: string, status: InquiryItem['status']) => {
    try {
      const response = await fetch(`/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('상태 업데이트에 실패했습니다.');
      }
      
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id ? { ...inquiry, status } : inquiry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 업데이트에 실패했습니다.');
    }
  }, []);

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    updateInquiryStatus,
  };
};

export const useInquiryForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'medium' as const,
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      category: '',
      priority: 'medium',
    });
  }, []);

  return {
    formData,
    handleInputChange,
    resetForm,
  };
};
