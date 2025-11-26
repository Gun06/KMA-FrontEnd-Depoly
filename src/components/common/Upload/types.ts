export type UploadItem = {
  id: string;
  file: File | null;  // 기존 파일의 경우 null
  name: string;
  size: number;     // bytes
  sizeMB: number;   // MB (정수, 표시용)
  tooLarge: boolean;
  error?: string;
  isExisting?: boolean;  // 기존 파일 여부
  url?: string;          // 기존 파일의 URL
};

export type MultipleUploaderProps = {
  label?: React.ReactNode;
  accept?: string;
  maxSizeMB?: number;     // 단일 파일 제한 (기본 20)
  multiple?: boolean;     // 기본 다중
  maxCount?: number;      // 기본 10개
  totalMaxMB?: number;    // 전체 합 제한(선택)
  disabled?: boolean;

  // 제어/비제어
  value?: UploadItem[];
  onChange?: (items: UploadItem[]) => void;

  helper?: React.ReactNode;
  className?: string;
};
