"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import { BoardDetailListEditToolbar } from "@/components/admin/boards/BoardAdminToolbar";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import { RichTextContent } from "@/components/common/RichTextContent";
import type { NoticeEventRow, NoticeFile } from "@/types/notice";
import {
  BoardCardTitleBar,
  BoardDetailCard,
  BoardDetailHeader,
  BoardDetailPage,
  BoardDetailSection,
  boardFormHintClass,
} from "@/components/admin/boards/BoardDetailFrame";

type Props = {
  detail: NoticeEventRow;
  onBack: () => void;
  onSave: (content: string, files: NoticeFile[]) => void;
  pageTitle?: string;
};

export default function NoticeDetailPanel({
  detail,
  onBack,
  onSave,
  pageTitle = "공지사항",
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [contentHtml, setContentHtml] = React.useState("");
  const [files, setFiles] = React.useState<NoticeFile[]>([]);

  React.useEffect(() => {
    if (detail?.content) {
      setContentHtml(detail.content || "");
      setFiles(detail.files ?? []);
    } else {
      setContentHtml("");
      setFiles([]);
    }
  }, [detail?.id, detail?.content, detail?.files]);

  const onClickEdit = () => {
    setEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("content-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSave = () => {
    onSave(contentHtml, files);
    setEditing(false);
  };

  return (
    <BoardDetailPage>
      <BoardDetailCard>
        <BoardCardTitleBar
          title={pageTitle}
          action={<BoardDetailListEditToolbar onList={onBack} onEdit={onClickEdit} />}
        />
        <BoardDetailHeader
          title={detail.title}
          meta={`작성자 ${detail.author} · 작성일 ${detail.date}`}
        />
        <BoardDetailSection>
          {detail.content ? (
            <RichTextContent html={detail.content} variant="responsiveCompact" />
          ) : (
            <p className="text-sm text-gray-600 sm:text-base">내용이 없습니다.</p>
          )}
        </BoardDetailSection>
        {detail.files && detail.files.length > 0 ? (
          <BoardDetailSection label="첨부파일" className="border-t border-gray-200">
            <BoardFileBox variant="view" files={detail.files} />
          </BoardDetailSection>
        ) : null}
      </BoardDetailCard>

      {editing ? (
        <BoardDetailCard>
          <BoardCardTitleBar title="공지 수정" />
          <BoardDetailSection id="content-editor">
            <TextEditor
              initialContent={contentHtml}
              onChange={setContentHtml}
              height="360px"
              imageDomainType="NOTICE"
              placeholder="내용을 작성해주세요..."
              defaultFontSize="16px"
              defaultTextColor="#000000"
              showLink
            />
          </BoardDetailSection>
          <BoardDetailSection className="border-t border-gray-200">
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
              showQuotaText={false}
            />
            <div className={boardFormHintClass}>
              <p>• 첨부파일 이름이 너무 길면 등록이 실패할 수 있습니다</p>
            </div>
          </BoardDetailSection>
          <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3 sm:px-5">
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => setEditing(false)}>
              취소하기
            </Button>
            <Button size="sm" tone="primary" widthType="pager" onClick={handleSave}>
              저장하기
            </Button>
          </div>
        </BoardDetailCard>
      ) : null}
    </BoardDetailPage>
  );
}
