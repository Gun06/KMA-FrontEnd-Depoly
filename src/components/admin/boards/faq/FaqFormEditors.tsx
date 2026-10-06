'use client';

import type React from 'react';
import FormRow from '@/components/admin/Form/FormRow';
import TextEditor from '@/components/common/TextEditor/TextEditor';
import type { Editor } from '@tiptap/react';
import {
  BoardCafe24FormTable,
  boardCafe24EditorFrameClass,
  boardCafe24RowBlockClass,
  boardCafe24RowFieldClass,
} from '@/components/admin/boards/BoardCafe24FormTable';
import { BoardDetailCard, BoardFormCard } from '@/components/admin/boards/BoardDetailFrame';

type FaqFormEditorsProps = {
  cardTitle?: string;
  titleAction?: React.ReactNode;
  /** 제목 필드(카페24 FormRow) — FAQ 등록 stub 등 */
  titleField?: React.ReactNode;
  questionKey?: string;
  answerKey?: string;
  initialQuestion?: string;
  initialAnswer?: string;
  onQuestionChange: (html: string) => void;
  onAnswerChange: (html: string) => void;
  onQuestionEditorReady?: (editor: Editor | null) => void;
  onAnswerEditorReady?: (editor: Editor | null) => void;
};

export function FaqFormEditors({
  cardTitle,
  titleAction,
  titleField,
  questionKey,
  answerKey,
  initialQuestion = '',
  initialAnswer = '',
  onQuestionChange,
  onAnswerChange,
  onQuestionEditorReady,
  onAnswerEditorReady,
}: FaqFormEditorsProps) {
  const table = (
    <BoardCafe24FormTable labelWidth={120}>
      {titleField ? (
        <FormRow label="제목" contentClassName={boardCafe24RowFieldClass}>
          {titleField}
        </FormRow>
      ) : null}
      <FormRow label="질문" contentClassName={boardCafe24RowBlockClass}>
        <TextEditor
          key={questionKey}
          initialContent={initialQuestion}
          showFormatting
          showFontSize
          showTextColor
          showImageUpload={false}
          height="200px"
          placeholder="질문 내용을 입력하세요..."
          onChange={onQuestionChange}
          onEditorReady={onQuestionEditorReady}
          defaultTextColor="#1F2937"
          defaultFontSize="16px"
          showLink
          frameClassName={boardCafe24EditorFrameClass}
        />
      </FormRow>
      <FormRow label="답변" contentClassName={boardCafe24RowBlockClass}>
        <TextEditor
          key={answerKey}
          initialContent={initialAnswer}
          showFormatting
          showFontSize
          showTextColor
          showImageUpload={false}
          height="300px"
          placeholder="답변 내용을 입력하세요..."
          onChange={onAnswerChange}
          onEditorReady={onAnswerEditorReady}
          defaultTextColor="#374151"
          defaultFontSize="16px"
          showLink
          frameClassName={boardCafe24EditorFrameClass}
        />
      </FormRow>
    </BoardCafe24FormTable>
  );

  if (cardTitle) {
    return (
      <BoardFormCard title={cardTitle} titleAction={titleAction} cafe24Body>
        {table}
      </BoardFormCard>
    );
  }

  return (
    <BoardDetailCard>
      <div className="border-t border-neutral-300">{table}</div>
    </BoardDetailCard>
  );
}
