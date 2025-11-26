"use client";

import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function Client() {
  return (
    <BoardEventList
      title="대회별 팝업"
      tableCtaLabel="메인 팝업 관리하기 >"
      tableCtaHref="/admin/banners/popups/main"
      basePath="popup"
    />
  );
}
