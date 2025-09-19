"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import SelectMenu from "@/components/common/filters/SelectMenu";
import TextField from "@/components/common/TextField/TextField";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";

import type { NoticeType, NoticeFile, Visibility } from "@/data/notice/types";
import { getMainNoticeDetail, saveMainNotice } from "@/data/notice/main"; 
// ↑ saveMainNotice(noticeId: string|number, payload: {type,eventTitle,visibility,pinned?,content?,files?}) 를
// data/notice/main.ts에 구현해 두세요. (이벤트용 saveEventNotice와 동일 패턴)

export default function Page() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const router = useRouter();

  const base = React.useMemo(() => getMainNoticeDetail(noticeId), [noticeId]);

  const [type, setType] = React.useState<NoticeType>(base?.type ?? "notice");
  const [eventTitle, setEventTitle] = React.useState<string>(base?.eventTitle ?? "");
  const [content, setContent] = React.useState<string>((base as any)?.content ?? "<p>내용을 작성해주세요...</p>");
  const [files, setFiles] = React.useState<NoticeFile[]>(((base as any)?.files ?? []) as NoticeFile[]);
  const [visibility, setVisibility] = React.useState<Visibility>(base?.visibility ?? "open");
  const [pinned, setPinned] = React.useState<boolean>(!!(base as any)?.pinned);

  React.useEffect(() => {
    const d = getMainNoticeDetail(noticeId);
    setType(d?.type ?? "notice");
    setEventTitle(d?.eventTitle ?? "");
    setContent((d as any)?.content ?? "<p>내용을 작성해주세요...</p>");
    setFiles(((d as any)?.files ?? []) as NoticeFile[]);
    setVisibility(d?.visibility ?? "open");
    setPinned(!!(d as any)?.pinned);
  }, [noticeId]);

  const TYPES = [
    { label: "대회", value: "match" },
    { label: "이벤트", value: "event" },
    { label: "공지", value: "notice" },
    { label: "일반", value: "general" },
  ];
  const canPin = type === "notice";

  const onSave = () => {
    if (!eventTitle.trim()) { alert("제목을 입력하세요."); return; }
    saveMainNotice(noticeId, {
      type,
      eventTitle: eventTitle.trim(),
      visibility,
      pinned: canPin ? pinned : false,
      content,
      files,
    });
    router.replace(`/admin/boards/notice/main/${noticeId}?_r=${Date.now()}`);
  };

  const goView = () => router.replace(`/admin/boards/notice/main/${noticeId}?_r=${Date.now()}`);

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goView}>취소하기</Button>
        <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>저장하기</Button>
      </div>

      {/* 1줄: 유형 + 제목(eventTitle) */}
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
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
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

      {/* 에디터 */}
      <TextEditor initialContent={content} onChange={setContent} height="520px" />

      {/* 첨부파일 */}
      <BoardFileBox
        variant="edit"
        title="첨부파일"
        files={files}
        onChange={setFiles}
        label="첨부파일 업로드"
        maxCount={10}
        maxSizeMB={20}
        totalMaxMB={200}
        multiple
        className="mt-2"
        showQuotaText={false}
      />
    </main>
  );
}
