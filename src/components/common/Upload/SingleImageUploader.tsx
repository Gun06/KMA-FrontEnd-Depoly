'use client';

import React from 'react';
import Image from 'next/image';
import UploadButton from './UploadButton';
import { formatBytes, isImage } from './utils';

type Props = {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: File | null;
  defaultValue?: File | null;
  disabled?: boolean;
  readOnly?: boolean;
  /** 버튼 우측(데스크톱) / 버튼 아래(모바일) 안내문 */
  helper?: string;
  onChange?: (file: File | null) => void;
};

export default function SingleImageUploader({
  label = '대표 이미지 업로드',
  accept = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml',
  maxSizeMB = 20,
  value,
  defaultValue = null,
  disabled,
  readOnly,
  helper = '선택된 파일 없음. 파일 형식:JPG, JPEG, PNG, GIF, BMP, WEBP, SVG / 20MB 이내',
  onChange,
}: Props) {
  const [file, setFile] = React.useState<File | null>(value ?? defaultValue);
  const [thumb, setThumb] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const controlled = value !== undefined;
  React.useEffect(() => {
    if (controlled) setFile(value ?? null);
  }, [controlled, value]);

  React.useEffect(() => {
    if (!file) return setThumb(null);
    const url = URL.createObjectURL(file);
    setThumb(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const select = (list: FileList) => {
    const f = list[0];
    if (!f) return;
    if (!isImage(f)) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (f.size > maxBytes) {
      setError(`파일 용량이 큽니다. ${maxSizeMB}MB 미만만 허용됩니다.`);
      return;
    }
    setError(null);
    setFile(f);
    onChange?.(f);
  };

  const clear = () => {
    setFile(null);
    onChange?.(null);
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <UploadButton
            label={label}
            accept={accept}
            multiple={false}
            disabled={disabled}
            onFilesSelected={select}
            className="self-start"
          />
          <p className="text-xs sm:text-sm text-[#8A949E] sm:ml-2">{helper}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
        {/* 썸네일 */}
        <div className="relative h-[160px] w-[240px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center">
          {thumb ? (
            <Image
              src={thumb}
              alt="미리보기"
              fill
              sizes="240px"
              unoptimized
              style={{ objectFit: 'contain' }}
              priority={false}
            />
          ) : (
            <span className="text-[12px] text-[#9CA3AF]">미리보기가 없습니다</span>
          )}
        </div>

        {/* 파일 메타 + 제거 */}
        {file && (
          <div className="space-y-2">
            <div className="text-[14px] min-w-0">
              <div className="text-[#0F1113] truncate max-w-[400px]" title={file.name}>{file.name}</div>
              <div className="text-[#6B7280]">{formatBytes(file.size)}</div>
            </div>
            {!readOnly && (
              <button
                type="button"
                className="rounded border border-[#CBD5E1] px-3 py-1.5 text-[12px] hover:bg-gray-50"
                onClick={clear}
                disabled={disabled}
              >
                제거 ✕
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[12px] text-[#C53030]">{error}</p>}
    </div>
  );
}
