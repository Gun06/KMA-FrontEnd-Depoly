"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import Button from "@/components/common/Button/Button";
import SelectMenu from "@/components/common/filters/SelectMenu";
import TextField from "@/components/common/TextField/TextField";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";

import type { NoticeType, NoticeFile, NoticeEventRow, Visibility } from "@/data/notice/types";
import { getEventById } from "@/data/events";
import { getEventNoticeDetail, saveEventNotice } from "@/data/notice/eventNotices";

export default function Page() {
  const { eventId, noticeId } = useParams<{ eventId: string; noticeId: string }>();
  const router = useRouter();

  const event = getEventById(Number(eventId));
  const [detail, setDetail] = React.useState<NoticeEventRow | undefined>(() =>
    getEventNoticeDetail(eventId, noticeId)
  );

  const [type, setType] = React.useState<NoticeType>(detail?.type ?? "notice");
  const [title, setTitle] = React.useState(detail?.title ?? "");
  const [content, setContent] = React.useState(detail?.content ?? "내용을 작성해주세요...");
  const [pinned, setPinned] = React.useState<boolean>(!!detail?.pinned);
  const [files, setFiles] = React.useState<NoticeFile[]>(detail?.files ?? []);
  const [visibility, setVisibility] = React.useState<Visibility>(detail?.visibility ?? "open");

  React.useEffect(() => {
    const d = getEventNoticeDetail(eventId, noticeId);
    setDetail(d);
    setType(d?.type ?? "notice");
    setTitle(d?.title ?? "");
    setContent(d?.content ?? "내용을 작성해주세요...");
    setPinned(!!d?.pinned);
    setFiles(d?.files ?? []);
    setVisibility(d?.visibility ?? "open");
  }, [eventId, noticeId]);

  const TYPES = [
    { label: "대회", value: "match" },
    { label: "이벤트", value: "event" },
    { label: "공지", value: "notice" },
    { label: "일반", value: "general" },
  ];
  const canPin = type === "notice";

  const onSave = () => {
    if (!detail) return;
    const next: NoticeEventRow = {
      ...detail,
      type,
      title: title.trim() || detail.title,
      content,
      pinned: canPin ? pinned : false,
      files,
      visibility,
    };
    saveEventNotice(eventId, next);
    // 저장 후 상세(비-edit)로 이동
    router.replace(`/admin/boards/notice/events/${eventId}/${noticeId}?_r=${Date.now()}`);
  };

  const goView = () =>
    router.replace(`/admin/boards/notice/events/${eventId}/${noticeId}?_r=${Date.now()}`);

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <div className="ml-auto flex gap-2">
          <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goView}>취소하기</Button>
          <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>저장하기</Button>
        </div>
      </div>

      {!detail ? (
        <div className="rounded-xl border p-8 text-center text-gray-500">데이터가 없습니다.</div>
      ) : (
        <section className="space-y-4">
          {/* 1줄: 유형 + 제목 */}
          <div className="flex gap-3 items-center">
            <SelectMenu
              label="유형"
              value={type}
              onChange={(v) => setType(v as NoticeType)}
              options={TYPES}
              buttonTextMode="current"
              className="!h-12"
            />
            <TextField
              type="text"
              placeholder="제목을 입력하세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 !h-12"
            />
          </div>

          {/* 2줄: 고정 + 공개여부 */}
          <div className="flex items-center gap-8">
            <label className={`inline-flex items-center gap-2 ${canPin ? "" : "opacity-50 cursor-not-allowed"}`}>
              <input
                type="checkbox"
                disabled={!canPin}
                checked={canPin && pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <span>고정</span>
            </label>

            <div className="inline-flex items-center gap-3">
              <span className="text-sm text-gray-700">공개여부</span>
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === "open"}
                  onChange={() => setVisibility("open")}
                />
                <span>공개</span>
              </label>
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === "closed"}
                  onChange={() => setVisibility("closed")}
                />
                <span>비공개</span>
              </label>
            </div>
          </div>

          <TextEditor initialContent={content} onChange={setContent} height="520px" />

          <BoardFileBox
            variant="edit"
            title="첨부파일"
            files={files}
            onChange={setFiles}
            maxCount={10}
            maxSizeMB={20}
            totalMaxMB={200}
            multiple
            className="mt-2"
          />
        </section>
      )}
    </main>
  );
}
