"use client";

import { useRouter } from "next/navigation";
import InquiryListPage from "@/components/admin/boards/inquiry/InquiryListPage";
import { InquiryToggleTabs } from "@/components/admin/boards/inquiry/InquiryToggleTabs";

export default function Page() {
  const router = useRouter();

  return (
    <InquiryListPage
      apiType="all"
      title={undefined}
      titleAddon={
        <InquiryToggleTabs
          active="all"
          onSelect={(value) => {
            if (value === "event") router.push("/admin/boards/inquiry");
          }}
        />
      }
      linkForRow={(r) =>
        r.__replyOf
          ? `/admin/boards/inquiry/main/${r.__replyOf}?returnTo=all#answer`
          : `/admin/boards/inquiry/main/${r.id}?returnTo=all`
      }
      onDelete={() => {
        /* InquiryListPage 내부에서 삭제 로직 처리 */
      }}
    />
  );
}

