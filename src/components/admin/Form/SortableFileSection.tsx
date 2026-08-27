// src/components/admin/Form/SortableFileSection.tsx
"use client";

import React from "react";
import FormRow from "@/components/admin/Form/FormRow";
import SortableFileUploader from "@/components/common/Upload/SortableFileUploader";
import ReadonlyFileList, { ReadonlyFile } from "@/components/common/Upload/ReadonlyFileList";
import type { PageMediaKey } from "@/utils/pendingVideoLinks";

type Props = {
  label: string;
  editable: boolean;
  valueEditable?: any;
  onChangeEditable?: (files: any) => void;
  valueReadonly?: ReadonlyFile[];
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  single?: boolean;
  helper?: string;

  /** 유튜브 영상 링크를 이미지와 함께 등록 */
  allowVideoLink?: boolean;
  pageMediaKey?: PageMediaKey;

  /** ✅ FormRow의 content 쪽 클래스 (라벨에는 영향 없음) */
  contentClassName?: string;
};

export default function SortableFileSection({
  label,
  editable,
  valueEditable,
  onChangeEditable,
  valueReadonly = [],
  accept = "image/*",
  maxSizeMB = 20,
  multiple = true,
  single,
  helper,
  allowVideoLink,
  pageMediaKey,
  contentClassName = "px-4",
}: Props) {
  return (
    <FormRow label={label} contentClassName={contentClassName}>
      {editable ? (
        <SortableFileUploader
          label="이미지 업로드"
          accept={accept}
          maxSizeMB={maxSizeMB}
          multiple={multiple}
          single={single}
          helper={helper}
          value={valueEditable}
          onChange={onChangeEditable}
          allowVideoLink={allowVideoLink}
          pageMediaKey={pageMediaKey}
        />
      ) : (
        <ReadonlyFileList files={valueReadonly} />
      )}
    </FormRow>
  );
}

