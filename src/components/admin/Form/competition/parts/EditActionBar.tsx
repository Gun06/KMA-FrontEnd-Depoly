"use client";
import Link from "next/link";
import Button from "@/components/common/Button/Button";

type Props = {
  isEditPage: boolean;
  isEditing: boolean;
  loading: boolean;
  onBack?: () => void;
  onStartEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  editHref?: string;
};

export default function EditActionBar({
  isEditPage,
  isEditing,
  loading,
  onBack,
  onStartEdit,
  onCancel,
  onSave,
  onSubmit,
  onDelete,
  editHref,
}: Props) {
  // create | view | editing 으로 상태 한 줄 정규화
  const variant: "create" | "view" | "editing" =
    !isEditPage ? "create" : isEditing ? "editing" : "view";

  const UI: Record<typeof variant, JSX.Element[]> = {
    create: [
      <Button key="cancel" tone="dark" size="sm" widthType="pager" onClick={onBack} disabled={loading}>
        취소하기
      </Button>,
      <Button
        key="submit"
        tone="primary"
        size="sm"
        widthType="pager"
        onClick={onSubmit}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "등록 중..." : "등록하기"}
      </Button>,
    ],
    view: [
      <Button key="back" tone="dark" size="sm" widthType="pager" onClick={onBack} disabled={loading}>
        뒤로가기
      </Button>,
      <Button key="delete" tone="danger" size="sm" widthType="pager" onClick={onDelete} disabled={loading}>
        삭제하기
      </Button>,
      editHref ? (
        <Link key="edit-link" href={editHref}>
          <Button tone="primary" size="sm" widthType="pager">수정하기</Button>
        </Link>
      ) : (
        <Button key="edit" tone="primary" size="sm" widthType="pager" onClick={onStartEdit}>
          수정하기
        </Button>
      ),
    ],
    editing: [
      <Button key="cancel" tone="outlineDark" variant="outline" size="sm" widthType="pager" onClick={onCancel} disabled={loading}>
        수정 취소
      </Button>,
      <Button
        key="save"
        tone="primary"
        size="sm"
        widthType="pager"
        onClick={onSave}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "저장 중..." : "저장하기"}
      </Button>,
    ],
  };

  return <div className="flex items-center gap-2">{UI[variant]}</div>;
}
