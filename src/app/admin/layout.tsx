import React from "react";
import AdminLayout from "@/layouts/admin/AdminLayout";
import Providers from "./Providers";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <Providers>{children}</Providers>
    </AdminLayout>
  );
}
