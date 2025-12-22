"use client";

import React from "react";
import { AdminEventsProvider } from "@/components/providers/AdminEventsContext";
import QueryProvider from "@/components/providers/QueryProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  // persist 켜서 라우팅/새로고침에도 수정사항 유지
  return (
    <QueryProvider>
      <AdminEventsProvider>{children}</AdminEventsProvider>
    </QueryProvider>
  );
}
