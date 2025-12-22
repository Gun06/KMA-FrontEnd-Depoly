'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SubmenuLayout from '@/layouts/main/SubmenuLayout/SubmenuLayout';
import { ChevronLeft, Edit, Trash2, Download, Eye, MessageSquare } from 'lucide-react';

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params?.id;

  // 기존 URL을 새로운 구조로 리다이렉트
  useEffect(() => {
    if (inquiryId) {
      router.replace(`/notice/inquiry/particular?id=${inquiryId}`);
    }
  }, [inquiryId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 이동하는 중...</p>
      </div>
    </div>
  );
}