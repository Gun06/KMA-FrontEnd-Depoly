// src/components/common/Upload/Upload.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import FileUploader from "./FileUploader";
import SingleImageUploader from "./SingleImageUploader";
import EventUploader from "./EventUploader";

const meta: Meta<typeof FileUploader> = {
  title: "UI/Upload",
  component: FileUploader, // 기본 컨트롤 기준은 멀티 업로더
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "공통 파일 업로드 컴포넌트 모음.",
          "- **FileUploader**: 목록/개별삭제/전체삭제/드롭존/용량제한/개수제한",
          "- **SingleImageUploader**: 대표 이미지(단일) 업로드 + 썸네일",
          "- **EventUploader**: 이벤트용 단일(70×40) 업로드 버튼",
          "",
          "기본 **최대 용량**은 `20MB`이며 초과 시 붉은 경고 박스를 표시합니다.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    accept: { control: "text" },
    maxSizeMB: { control: { type: "number", min: 1, step: 1 } },
    totalMaxMB: { control: { type: "number", min: 1, step: 1 } },
    maxCount: { control: { type: "number", min: 1, step: 1 } },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    multiple: true,
    accept: ".pdf,.png,.jpg,.jpeg,.webp",
    maxSizeMB: 20,
    totalMaxMB: 200,
    maxCount: 10,
    label: "첨부파일 업로드",
  },
  tags: ["autodocs"],
};
export default meta;

type S = StoryObj<typeof FileUploader>;

/** 1) 멀티 업로드 - 기본 */
export const Multiple_Uncontrolled: S = {
  name: "멀티 업로드 - 기본",
  render: (args) => <FileUploader {...args} />,
};

/** 2) 멀티 업로드 - onChange 미리보기(Controlled) */
export const Multiple_ControlledPreview: S = {
  name: "멀티 업로드 - onChange 미리보기",
  render: (args) => {
    const [files, setFiles] = React.useState<any[]>([]);
    return (
      <div className="space-y-4">
        <FileUploader
          {...args}
          onChange={(items) => {
            setFiles(items);
          }}
        />
        <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md overflow-auto">
          {JSON.stringify(files, null, 2)}
        </pre>
      </div>
    );
  },
};

/** 3) 단일 이미지 업로드 - SingleImageUploader */
type SAny = StoryObj;
export const SingleImage_Basic: SAny = {
  name: "단일 이미지 업로드 (대표 이미지 + 썸네일)",
  parameters: {
    controls: {
      include: ["label", "accept", "maxSizeMB", "disabled"],
    },
    docs: {
      description: {
        story:
          "SingleImageUploader는 단일 이미지 전용. 업로드 시 버튼이 숨겨지고 썸네일/파일명/용량/삭제만 표시됩니다.",
      },
    },
  },
  args: {
    label: "대표 이미지 업로드",
    accept: ".png,.jpg,.jpeg,.webp,.gif",
    maxSizeMB: 20,
    disabled: false,
  },
  render: (args: any) => (
    <div className="space-y-4">
      <SingleImageUploader
        label={args.label}
        accept={args.accept}
        maxSizeMB={args.maxSizeMB}
        disabled={args.disabled}
      />
    </div>
  ),
};

/** 4) 이벤트 업로드(단일 70×40 버튼) — EventUploader 데모 */
export const EventUpload_Single: SAny = {
  name: "이벤트 업로드 (단일 70×40)",
  parameters: {
    controls: {
      include: ["label", "accept", "maxSizeMB", "totalMaxMB", "disabled"],
    },
    docs: {
      description: {
        story:
          "EventUploader는 단일 파일 업로드 전용(버튼 70×40). 업로드 후 파일명/삭제 버튼 표시, 삭제 시 버튼 재노출.",
      },
    },
  },
  args: {
    label: "첨부파일",
    accept: ".pdf,.png,.jpg,.jpeg,.webp",
    maxSizeMB: 20,
    totalMaxMB: undefined,
    disabled: false,
  },
  render: (args: any) => (
    <div className="space-y-4">
      <EventUploader
        label={args.label}
        accept={args.accept}
        maxSizeMB={args.maxSizeMB}
        totalMaxMB={args.totalMaxMB}
        disabled={args.disabled}
      />
    </div>
  ),
};
