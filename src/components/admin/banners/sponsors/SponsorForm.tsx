"use client";

import React from "react";
import FormRow from "@/components/admin/Form/FormRow";
import TextField from "@/components/common/TextField/TextField";
import NoticeMessage from "@/components/admin/Form/NoticeMessage";
import UploadButton from "@/components/common/Upload/UploadButton";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { formatBytes } from "@/components/common/Upload/utils";
import type { UploadItem } from "@/components/common/Upload/types";
import clsx from "clsx";

export type SponsorFormData = {
  url: string;
  visible: boolean;
};

type Props = {
  value: SponsorFormData;
  onChange?: (next: SponsorFormData) => void;
  imageFile?: File | null;
  imageItem?: UploadItem | null;
  onImageChange?: (file: File | null) => void;
  readOnly?: boolean;
  fieldCls?: string;
  inputColorCls?: string;
  dense?: boolean;
  className?: string;
};

export default function SponsorForm({
  value,
  onChange,
  imageFile,
  imageItem,
  onImageChange,
  readOnly = false,
  fieldCls = "w-full",
  inputColorCls,
  dense = false,
  className,
}: Props) {
  const patch = (p: Partial<SponsorFormData>) => onChange?.({ ...value, ...p });

  const dimCls = readOnly ? "text-[#646464]" : "text-black";
  const readOnlyInputCls = "!border-0 !ring-0 !outline-none bg-transparent";
  const computedInputCls = inputColorCls ?? (readOnly ? readOnlyInputCls : "");
  const pad = dense ? "p-0" : "p-4";

  // 텍스트 입력 전용 회색 톤(placeholder 포함)
  const textDimCls = readOnly ? "text-[#646464] placeholder:text-[#9CA3AF]" : "";

  // 이미지 미리보기 URL 생성
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (imageItem?.previewUrl || imageItem?.url) {
      setPreviewUrl(imageItem.previewUrl || imageItem.url || null);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile, imageItem]);

  // 이미지 미리보기 컴포넌트 (2:1 비율, 가로 1600px 기준)
  // 미리보기 크기: 약 400px × 200px (비율 유지)
  const ImagePreview = () => {
    const defaultImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f3f4f6' width='400' height='200'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

    return (
      <div className="relative h-[200px] w-[400px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center shrink-0">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="스폰서 이미지 미리보기"
            fill
            sizes="400px"
            unoptimized
            style={{ objectFit: 'cover' }}
            priority={false}
            className="rounded-lg"
          />
        ) : (
          <span className="text-sm text-[#9CA3AF]">미리보기가 없습니다</span>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-[1300px] mx-auto w-full ${className ?? ""}`}>
      <div className="border-t border-r border-b border-[#E5E7EB]">
        <div className="divide-y divide-[#E5E7EB]">
          {/* 1) 스폰서 URL */}
          <div className={pad}>
            <FormRow label="스폰서 URL">
              <TextField
                placeholder="https://example.com"
                value={value.url}
                onChange={(e) =>
                  readOnly ? undefined : patch({ url: e.currentTarget.value })
                }
                className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                readOnly={readOnly}
              />
            </FormRow>
          </div>

          {/* 2) 이미지 */}
          <div className={pad}>
            <FormRow 
              label={
                <div className="flex items-center gap-2">
                  <span>이미지</span>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                      <div className="mb-1 font-semibold">권장 이미지 사이즈:</div>
                      <div>• 가로 1600px 이상 (비율 2:1)</div>
                      <div>• 파일 형식: JPG, PNG</div>
                      <div>• 최대 용량: 20MB 이하</div>
                    </div>
                  </div>
                </div>
              }
              contentClassName="items-start py-4 pl-4"
            >
              <div className="w-full space-y-4">
                {/* 업로드 버튼과 안내문 - 상단 */}
                {!readOnly && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <UploadButton
                      label="이미지 업로드"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple={false}
                      disabled={readOnly}
                      onFilesSelected={(list) => {
                        const file = list[0];
                        if (file) onImageChange?.(file);
                      }}
                      className="shrink-0"
                    />
                    <p className="text-xs text-[#8A949E]">
                      파일 형식: JPG, JPEG, PNG, WEBP / 20MB 이내
                    </p>
                  </div>
                )}

                {/* 미리보기와 파일 정보 - 하단 */}
                <div className="flex items-start gap-4 flex-wrap">
                  {/* 미리보기 이미지 - 항상 표시 */}
                  <ImagePreview />

                  {/* 파일 정보 - 파일이 있을 때만 표시 */}
                  {(imageFile || imageItem) && (
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#0F1113] truncate" title={imageFile?.name || imageItem?.name || '이미지'}>
                          {imageFile?.name || imageItem?.name || '이미지'}
                        </div>
                        {(imageFile || imageItem) && (
                          <div className="text-xs text-[#6B7280]">
                            {imageFile ? formatBytes(imageFile.size) : imageItem?.sizeMB ? `${imageItem.sizeMB}MB` : ''}
                          </div>
                        )}
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors shrink-0"
                          onClick={() => onImageChange?.(null)}
                          disabled={readOnly}
                        >
                          제거 ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FormRow>
          </div>

          {/* 3) 공개 여부 */}
          <div className={pad}>
            <FormRow label="공개 여부" contentClassName="items-center">
              {readOnly ? (
                <div className="inline-flex items-center gap-1 pl-4">
                  {value.visible ? (
                    <span className="inline-flex items-center rounded-full px-2.5 h-7 text-[12px] font-medium border bg-[#1E5EFF] border-[#1E5EFF] text-white">
                      공개
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2.5 h-7 text-[12px] font-medium border bg-[#EF4444] border-[#EF4444] text-white">
                      비공개
                    </span>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 pl-4">
                  <button
                    type="button"
                    className={clsx('rounded-full px-2.5 h-7 text-[12px] font-medium border transition-colors',
                      value.visible 
                        ? 'bg-[#1E5EFF] border-[#1E5EFF] text-white' 
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200')}
                    onClick={() => patch({ visible: true })}
                  >
                    공개
                  </button>
                  <button
                    type="button"
                    className={clsx('rounded-full px-2.5 h-7 text-[12px] font-medium border transition-colors',
                      !value.visible 
                        ? 'bg-[#EF4444] border-[#EF4444] text-white' 
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200')}
                    onClick={() => patch({ visible: false })}
                  >
                    비공개
                  </button>
                </div>
              )}
            </FormRow>
          </div>
        </div>
      </div>

      {/* 하단 노티스 */}
      {!readOnly && (
        <div className="flex mx-auto px-4 mt-10 mb-10">
          <NoticeMessage
            items={[
              { text: "※ 이미지는 JPG, PNG 권장, 가로 1600px 이상 (비율 2:1), 20MB 이하." },
            ]}
          />
        </div>
      )}
    </div>
  );
}
