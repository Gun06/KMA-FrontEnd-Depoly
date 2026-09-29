"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import Link from "next/link";
import PopupListManager from '@/components/admin/banners/popups/components/PopupListManager';

export default function Client() {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <PopupListManager
        title="전마협 메인 팝업"
        headerAction={
          <Link href="/admin/banners/popups">
            <Button size="sm" tone="competition" className="!h-9 !px-3 !text-[13px]">
              대회사이트 팝업 관리하기 &gt;
            </Button>
          </Link>
        }
      />
    </main>
  );
}
