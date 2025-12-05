"use client";

import React from "react";
import InlineLabelPairRow from "@/components/admin/Form/InlineLabelPairRow";
import FormRow from "@/components/admin/Form/FormRow";
import TextField from "@/components/common/TextField/TextField";
import { RadioGroup } from "@/components/common/Radio/RadioGroup";
import BirthDateInput from "@/components/common/FormField/BirthDateInput";
import NoticeMessage from "@/components/admin/Form/NoticeMessage";
import UploadButton from "@/components/common/Upload/UploadButton";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { formatBytes } from "@/components/common/Upload/utils";
import type { Gallery } from "@/data/gallery/types";

type Props = {
  value: Gallery;
  onChange?: (next: Gallery) => void;
  thumbnailFile?: File | null;
  onThumbnailChange?: (file: File | null) => void;
  readOnly?: boolean;
  fieldCls?: string;
  inputColorCls?: string;
  dense?: boolean;
  className?: string;
};

export default function GalleryForm({
  value,
  onChange,
  thumbnailFile,
  onThumbnailChange,
  readOnly = false,
  fieldCls = "w-full",
  inputColorCls,
  dense = false,
  className,
}: Props) {
  const patch = (p: Partial<Gallery>) => onChange?.({ ...value, ...p });

  const dimCls = readOnly ? "text-[#646464]" : "text-black";
  const readOnlyInputCls = "!border-0 !ring-0 !outline-none bg-transparent";
  const computedInputCls = inputColorCls ?? (readOnly ? readOnlyInputCls : "");
  const pad = dense ? "p-0" : "p-4";

  // 텍스트 입력 전용 회색 톤(placeholder 포함)
  const textDimCls = readOnly ? "text-[#646464] placeholder:text-[#9CA3AF]" : "";

  type Visible = "on" | "off";
  const visibleValue: Visible = value.visible ? "on" : "off";
  const visibleNoop = (_v: Visible) => {};

  // 썸네일 미리보기 컴포넌트
  const ThumbnailPreview = ({ file, imageUrl }: { file: File | null | undefined; imageUrl?: string }) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (imageUrl) {
        setPreviewUrl(imageUrl);
      } else {
        setPreviewUrl(null);
      }
    }, [file, imageUrl]);

    // 16:9 비율 (1200px × 675px 기준)
    // 미리보기 크기: 약 400px × 225px (비율 유지)
    return (
      <div className="relative h-[225px] w-[400px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center shrink-0">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="썸네일 미리보기"
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
          {/* 1) 대회 태그명 / 대회명 */}
          <div className={pad}>
            <InlineLabelPairRow
              leftLabel="대회 태그명"
              rightLabel="대회명"
              leftField={
                <TextField
                  placeholder="대회 태그명을 입력하세요."
                  value={value.tagName}
                  onChange={(e) =>
                    readOnly ? undefined : patch({ tagName: e.currentTarget.value })
                  }
                  className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                  readOnly={readOnly}
                />
              }
              rightField={
                <TextField
                  placeholder="하단에 표시될 대회명을 입력하세요."
                  value={value.title}
                  onChange={(e) =>
                    readOnly ? undefined : patch({ title: e.currentTarget.value })
                  }
                  className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                  readOnly={readOnly}
                />
              }
            />
          </div>

          {/* 2) 공개여부 */}
          <div className={pad}>
            <FormRow label="공개여부" contentClassName="items-center pl-4">
              <div
                className={
                  readOnly
                    ? "text-[#646464] [&_label]:text-[#646464] [&_label]:opacity-100 [&_input:disabled+label]:opacity-100"
                    : ""
                }
              >
                <RadioGroup<Visible>
                  name={`gallery-visible-${value.eventId}`}
                  value={visibleValue}
                  onValueChange={readOnly ? visibleNoop : (v) => patch({ visible: v === "on" })}
                  gapPx={40}
                  options={[
                    { value: "on", label: "공개" },
                    { value: "off", label: "비공개" },
                  ]}
                  disabled={readOnly}
                />
              </div>
            </FormRow>
          </div>

          {/* 3) 대회기간 */}
          <div className={pad}>
            <FormRow label="대회기간" contentClassName="items-left mr-auto">
              <div className="flex items-center gap-3">
                <div className="min-w-[240px]">
                  <BirthDateInput
                    value={value.periodFrom}
                    onChange={readOnly ? undefined : (v) => patch({ periodFrom: v })}
                    placeholder="YYYY.MM.DD"
                    variant="flat"
                    className={`w-full ${dimCls}`}
                    disabled={readOnly}
                    readOnly={readOnly}
                  />
                </div>
                <span className="text-center">~</span>
                <div className="min-w-[240px]">
                  <BirthDateInput
                    value={value.periodTo}
                    onChange={readOnly ? undefined : (v) => patch({ periodTo: v })}
                    placeholder="YYYY.MM.DD"
                    variant="flat"
                    className={`w-full ${dimCls}`}
                    disabled={readOnly}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </FormRow>
          </div>

          {/* 4) 썸네일 이미지 */}
          <div className={pad}>
            <FormRow 
              label={
                <div className="flex items-center gap-2">
                  <span>썸네일 이미지</span>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                      <div className="mb-1 font-semibold">권장 이미지 사이즈:</div>
                      <div>• 실제 표시: 1200px × 675px (16:9 비율)</div>
                      <div>• 업로드 권장: 2400px × 1350px (2배 해상도)</div>
                      <div className="mt-2 text-gray-300">갤러리 카드에 표시될 썸네일 이미지입니다.</div>
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
                      label="썸네일 이미지 업로드"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif"
                      multiple={false}
                      disabled={readOnly}
                      onFilesSelected={(list) => {
                        const file = list[0];
                        if (file) onThumbnailChange?.(file);
                      }}
                      className="shrink-0"
                    />
                    <p className="text-xs text-[#8A949E]">
                      파일 형식: JPG, JPEG, PNG, GIF, WEBP, HEIC, HEIF, AVIF / 20MB 이내
                    </p>
                  </div>
                )}

                {/* 미리보기와 파일 정보 - 하단 */}
                <div className="flex items-start gap-4 flex-wrap">
                  {/* 미리보기 이미지 - 항상 표시 */}
                  <ThumbnailPreview file={thumbnailFile} imageUrl={value.thumbnailImageUrl} />

                  {/* 파일 정보 - 파일이 있을 때만 표시 */}
                  {thumbnailFile && (
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#0F1113] truncate" title={thumbnailFile.name}>
                          {thumbnailFile.name}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          {formatBytes(thumbnailFile.size)}
                        </div>
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors shrink-0"
                          onClick={() => onThumbnailChange?.(null)}
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

          {/* 5) 구글포토 URL */}
          <div className={pad}>
            <FormRow label="구글포토 URL">
              <TextField
                placeholder="https://photos.google.com/..."
                value={value.googlePhotosUrl ?? ""}
                onChange={(e) =>
                  readOnly ? undefined : patch({ googlePhotosUrl: e.currentTarget.value })
                }
                className={`${fieldCls} ${computedInputCls} ${textDimCls}`}
                readOnly={readOnly}
              />
            </FormRow>
          </div>
        </div>
      </div>

      {/* 하단 노티스 */}
      <div className="flex mx-auto px-4 mt-10 mb-10">
        <NoticeMessage
          items={[
            { text: "※ 이미지는 jpg, jpeg, png, gif, webp, heic, heif, avif 만 지원합니다." },
            { text: "※ 썸네일 이미지 실제 표시 사이즈: 1200px × 675px (16:9 비율)" },
            {
              text:
                "다만, 해상도 문제로 인하여 업로드는 각 2배인 2400px × 1350px로 작업하여 업로드 부탁드립니다.",
              highlight: true,
            },
          ]}
        />
      </div>
    </div>
  );
}
