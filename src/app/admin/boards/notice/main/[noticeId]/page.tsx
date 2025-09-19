"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";

import { getMainNoticeDetail } from "@/data/notice/main"; // 메인 데이터 소스

export default function Page() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const router = useRouter();

  const [detail, setDetail] = React.useState(() => getMainNoticeDetail(noticeId));
  React.useEffect(() => {
    setDetail(getMainNoticeDetail(noticeId));
  }, [noticeId]);

  const goList = () => router.replace(`/admin/boards/notice/main?_r=${Date.now()}`);
  const goEdit = () => router.push(`/admin/boards/notice/main/${noticeId}/edit`);

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <div className="ml-auto flex gap-2">
          <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goList}>목록으로</Button>
          <Button size="sm" tone="primary" widthType="pager" onClick={goEdit}>수정하기</Button>
        </div>
      </div>

      {!detail ? (
        <div className="rounded-xl border p-8 text-center text-gray-500">데이터가 없습니다.</div>
      ) : (
        <article className="rounded-xl border bg-white">
          <header className="px-6 pt-6 pb-2">
            {/* 메인은 eventTitle 사용 */}
            <h1 className="text-xl font-semibold">{detail.eventTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">
              작성자 {detail.author} · {detail.date} · 조회수 {detail.views.toLocaleString()}
            </p>
          </header>
          <div className="h-px bg-gray-100" />
          <div
            className="px-6 py-6 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: (detail as any).content ?? "" }}
          />
          <div className="px-6 pb-6">
            <BoardFileBox variant="view" files={(detail as any).files ?? []} />
          </div>
        </article>
      )}
    </main>
  );
}
