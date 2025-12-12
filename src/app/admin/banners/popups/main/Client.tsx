"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import Link from "next/link";
import PopupListManager from '@/components/admin/banners/popups/components/PopupListManager';

export default function Client() {
  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">전마협 메인 팝업</h3>
        <Link href="/admin/banners/popups">
          <Button size="sm" tone="competition">대회사이트 팝업 관리하기 &gt;</Button>
        </Link>
      </div>
      <PopupListManager />
    </div>
  );
}
