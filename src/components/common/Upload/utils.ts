// 공용 유틸/상수

import type { UploadItem } from "./types";

// ====== 형식/문구 상수 & 헬퍼 ======
export const ACCEPT_IMAGES =
  "image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp,image/svg+xml";

export const ACCEPT_DEFAULT =
  ".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg";

export const buildImageHelper = (maxMB = 20) =>
  `선택된 파일 없음. 파일 형식: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG / ${maxMB}MB 이내`;

export const buildMultiHelper = (maxCount = 10, maxMB = 20) =>
  `선택된 파일 없음. 최대 ${maxCount}개 / ${maxMB}MB 이내`;

// ====== 파일/사이즈 관련 유틸 ======
export const toMB = (bytes: number) =>
  Math.round((bytes / (1024 * 1024)) * 10) / 10;

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = 2;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const isImage = (file: File) =>
  file.type.startsWith("image/");

// ====== 업로드 항목 매핑 (단일 파일 용량 체크 포함) ======
export function mapFilesToItems(files: File[], maxSizeMB: number): UploadItem[] {
  return files.map((file) => {
    const sizeMB = Math.ceil(file.size / (1024 * 1024)); // 정수 MB 표기
    const tooLarge = sizeMB > maxSizeMB;

    const error = tooLarge
      ? `등록 가능한 파일 용량을 초과하였습니다.\n${maxSizeMB}MB 미만의 파일만 등록할 수 있습니다.`
      : undefined;

    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      sizeMB,
      tooLarge,
      error,
    };
  });
}
