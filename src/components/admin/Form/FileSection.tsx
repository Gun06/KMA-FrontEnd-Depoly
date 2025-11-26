// src/components/admin/Form/FileSection.tsx
"use client";

import React from "react";
import FormRow from "@/components/admin/Form/FormRow";
import FileUploader from "@/components/common/Upload/FileUploader";
import ReadonlyFileList, { ReadonlyFile } from "@/components/common/Upload/ReadonlyFileList";

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

  /** ✅ FormRow의 content 쪽 클래스 (라벨에는 영향 없음) */
  contentClassName?: string;
};

export default function FileSection({
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
  contentClassName = "px-4",      // ← 기본값
}: Props) {
  return (
    <FormRow label={label} contentClassName={contentClassName}>
      {editable ? (
        <FileUploader
          accept={accept}
          maxSizeMB={maxSizeMB}
          multiple={multiple}
          single={single}
          helper={helper}
          value={valueEditable}
          onChange={onChangeEditable}
        />
      ) : (
        <ReadonlyFileList files={valueReadonly} />
      )}
    </FormRow>
  );
}
