'use client';

import type React from 'react';
import FormRow from '@/components/admin/Form/FormRow';
import SelectMenu from '@/components/common/filters/SelectMenu';
import TextField from '@/components/common/TextField/TextField';
import TextEditor from '@/components/common/TextEditor';
import BoardFileBox from '@/components/admin/boards/BoardFileBox';
import type { Editor } from '@tiptap/react';
import type { NoticeFile } from '@/types/notice';
import {
  BoardCafe24FormTable,
  boardCafe24EditorFrameClass,
  boardCafe24RowBlockClass,
  boardCafe24RowFieldClass,
} from '@/components/admin/boards/BoardCafe24FormTable';
import { BoardFormCard } from '@/components/admin/boards/BoardDetailFrame';
import { NoticeFormFileHints } from '@/components/admin/boards/notice/NoticeFormFileHints';

type CategoryOption = { label: string; value: string };

type AdminNoticeFormBodyProps = {
  formTitle: string;
  titleAction?: React.ReactNode;
  categoryId: string;
  onCategoryChange: (id: string) => void;
  categoryOptions: CategoryOption[];
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (html: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  files: NoticeFile[];
  onFilesChange: (files: NoticeFile[]) => void;
  attachmentFormats?: string;
  disabled?: boolean;
};

export function AdminNoticeFormBody({
  formTitle,
  titleAction,
  categoryId,
  onCategoryChange,
  categoryOptions,
  title,
  onTitleChange,
  content,
  onContentChange,
  onEditorReady,
  files,
  onFilesChange,
  attachmentFormats,
  disabled = false,
}: AdminNoticeFormBodyProps) {
  return (
    <BoardFormCard title={formTitle} titleAction={titleAction} cafe24Body>
      <BoardCafe24FormTable labelWidth={120}>
        <FormRow label="카테고리" contentClassName={boardCafe24RowFieldClass}>
          <SelectMenu
            label="카테고리"
            value={categoryId}
            onChange={onCategoryChange}
            options={categoryOptions}
            buttonTextMode="current"
            dense
            fullWidth
            className="w-full max-w-[240px] min-w-0"
          />
        </FormRow>
        <FormRow label="제목" contentClassName={boardCafe24RowFieldClass}>
          <TextField
            type="text"
            placeholder="제목을 입력하세요."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            variant="flat"
            heightPx={52}
            fontSizePx={13}
            className="w-full min-w-0"
            disabled={disabled}
          />
        </FormRow>
        <FormRow label="내용" contentClassName={boardCafe24RowBlockClass}>
          <TextEditor
            initialContent={content}
            onChange={onContentChange}
            onEditorReady={onEditorReady}
            height="520px"
            imageDomainType="NOTICE"
            placeholder="내용을 작성해주세요..."
            defaultFontSize="16px"
            defaultTextColor="#000000"
            showLink
            frameClassName={boardCafe24EditorFrameClass}
          />
        </FormRow>
        <FormRow label="첨부파일" contentClassName={boardCafe24RowBlockClass}>
          <div className="w-full min-w-0 space-y-2">
            <BoardFileBox
              variant="edit"
              dense
              files={files}
              onChange={onFilesChange}
              label="첨부파일 업로드"
              maxCount={10}
              maxSizeMB={20}
              totalMaxMB={200}
              multiple
              showCount
              showQuotaText={false}
            />
            <NoticeFormFileHints attachmentFormats={attachmentFormats} />
          </div>
        </FormRow>
      </BoardCafe24FormTable>
    </BoardFormCard>
  );
}
