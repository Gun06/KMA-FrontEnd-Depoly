import { InquiryItem, InquiryFilter, InquiryFormData, InquiryResponse } from './types';

export const inquiryService = {
  // 문의사항 목록 조회
  async getInquiries(filters?: InquiryFilter): Promise<InquiryItem[]> {
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

    return response.json();
  },

  // 문의사항 상세 조회
  async getInquiry(id: string): Promise<InquiryItem> {
    const response = await fetch(`/api/inquiries/${id}`);

    if (!response.ok) {
      throw new Error('문의사항을 불러오는데 실패했습니다.');
    }

    return response.json();
  },

  // 문의사항 생성
  async createInquiry(data: InquiryFormData): Promise<InquiryItem> {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('문의사항 생성에 실패했습니다.');
    }

    return response.json();
  },

  // 문의사항 수정
  async updateInquiry(id: string, data: Partial<InquiryFormData>): Promise<InquiryItem> {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('문의사항 수정에 실패했습니다.');
    }

    return response.json();
  },

  // 문의사항 삭제
  async deleteInquiry(id: string): Promise<void> {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('문의사항 삭제에 실패했습니다.');
    }
  },

  // 문의사항 상태 업데이트
  async updateInquiryStatus(id: string, status: InquiryItem['status']): Promise<InquiryItem> {
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

    return response.json();
  },

  // 답변 목록 조회
  async getInquiryResponses(inquiryId: string): Promise<InquiryResponse[]> {
    const response = await fetch(`/api/inquiries/${inquiryId}/responses`);

    if (!response.ok) {
      throw new Error('답변을 불러오는데 실패했습니다.');
    }

    return response.json();
  },

  // 답변 생성
  async createResponse(inquiryId: string, content: string): Promise<InquiryResponse> {
    const response = await fetch(`/api/inquiries/${inquiryId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('답변 생성에 실패했습니다.');
    }

    return response.json();
  },
};
