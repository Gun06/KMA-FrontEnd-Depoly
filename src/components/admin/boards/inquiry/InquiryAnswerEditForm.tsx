'use client';

import FormRow from '@/components/admin/Form/FormRow';
import TextEditor from '@/components/common/TextEditor';
import { BoardFormSaveToolbar } from '@/components/admin/boards/BoardAdminToolbar';
import {
  BoardCafe24FormTable,
  boardCafe24EditorFrameClass,
  boardCafe24RowBlockClass,
} from '@/components/admin/boards/BoardCafe24FormTable';
import {
  BoardCardTitleBar,
  BoardDetailCard,
  BoardDetailHeader,
  BoardDetailPage,
} from '@/components/admin/boards/BoardDetailFrame';

type InquiryAnswerEditFormProps = {
  title: string;
  initialAnswer: string;
  onAnswerChange: (html: string) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  pageTitle?: string;
};

export function InquiryAnswerEditForm({
  title,
  initialAnswer,
  onAnswerChange,
  onCancel,
  onSave,
  isSaving,
  pageTitle = '문의 답변',
}: InquiryAnswerEditFormProps) {
  return (
    <BoardDetailPage>
      <BoardDetailCard>
        <BoardCardTitleBar
          title={pageTitle}
          action={
            <BoardFormSaveToolbar
              onCancel={onCancel}
              onSave={onSave}
              pending={isSaving}
              pendingLabel="저장 중..."
            />
          }
        />
        <BoardDetailHeader title={title} meta="문의에 대한 답변을 작성합니다." />
        <div className="border-t border-neutral-300">
          <BoardCafe24FormTable labelWidth={120}>
            <FormRow label="답변 내용" contentClassName={boardCafe24RowBlockClass}>
              <TextEditor
                initialContent={initialAnswer}
                onChange={onAnswerChange}
                height="420px"
                imageDomainType="ANSWER"
                placeholder="답변을 작성해주세요..."
                showLink
                frameClassName={boardCafe24EditorFrameClass}
              />
            </FormRow>
          </BoardCafe24FormTable>
        </div>
      </BoardDetailCard>
    </BoardDetailPage>
  );
}
