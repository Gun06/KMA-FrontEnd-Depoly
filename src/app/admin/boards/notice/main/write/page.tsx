// src/app/admin/boards/notice/main/write/page.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import SelectMenu from "@/components/common/filters/SelectMenu";
import TextField from "@/components/common/TextField/TextField";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";

import type { NoticeType, NoticeFile, Visibility } from "@/data/notice/types";
import { createMainNotice } from "@/data/notice/main";

export default function Page() {
  const router = useRouter();

  const [type, setType] = React.useState<NoticeType>("notice");
  const [eventTitle, setEventTitle] = React.useState("");   // ← 메인은 eventTitle
  const [content, setContent] = React.useState("<p>내용을 작성해주세요...</p>");
  const [files, setFiles] = React.useState<NoticeFile[]>([]);
  const [pinned, setPinned] = React.useState(false);
  const [visibility, setVisibility] = React.useState<Visibility>("open");

  const canPin = type === "notice";

  const onSave = () => {
    if (!eventTitle.trim()) { alert("제목을 입력하세요."); return; }
    const newId = createMainNotice({
      type,
      eventTitle: eventTitle.trim(),
      author: "Admin",
      visibility,
      pinned: canPin ? pinned : false,
      content,
      files,
    });
    router.replace(`/admin/boards/notice/main/${newId}`);
  };

  const goBack = () => router.replace(`/admin/boards/notice/main?_r=${Date.now()}`);

  const TYPES = [
    { label: "대회", value: "match" },
    { label: "이벤트", value: "event" },
    { label: "공지", value: "notice" },
    { label: "일반", value: "general" },
  ];

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={goBack}>취소하기</Button>
        <Button size="sm" tone="primary" widthType="pager" onClick={onSave}>등록하기</Button>
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
        <label
          className={`inline-flex items-center gap-2 ${canPin ? "" : "opacity-50 cursor-not-allowed"}`}
        >
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
