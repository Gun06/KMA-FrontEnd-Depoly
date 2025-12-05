// src/app/admin/applications/management/page.tsx
import { redirect } from 'next/navigation';

// 더미 데이터 제거됨 - 대회 목록 페이지로 리다이렉트
export default function Page() {
  // 더미 데이터가 없으므로 대회 목록 페이지로 리다이렉트
  redirect('/admin/applications/list');
}
