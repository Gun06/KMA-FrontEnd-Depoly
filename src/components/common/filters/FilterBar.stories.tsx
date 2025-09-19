/* eslint-disable react/display-name */
import type { Meta, StoryObj, Decorator } from "@storybook/react";
import React from "react";
import FilterBar, { type FilterBarProps } from "./FilterBar";
import { PRESETS } from "./presets";

// ▶ 공통 컨테이너를 '명명된' 컴포넌트로 분리
const WithContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="mx-auto w-full max-w-none px-6 md:px-10 py-8 md:py-12 overflow-x-auto">
    <div className="min-w-[1200px]">{children}</div>
  </div>
);
WithContainer.displayName = "WithContainer";

// ▶ Decorator도 이름을 가진 함수로
const withContainer: Decorator = (Story) => (
  <WithContainer>
    <Story />
  </WithContainer>
);

const meta: Meta<typeof FilterBar> = {
  title: "Ui/Filters/FilterBar/Presets",
  component: FilterBar,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "largeDesktop" },
    controls: { disable: true },
    actions: { argTypesRegex: "^on.*" },
  },
  decorators: [withContainer],
  tags: ["autodocs"],
};
export default meta;

type S = StoryObj<typeof FilterBar>;

// ▶ 프리셋 렌더 도우미: '이름 있는' 컴포넌트를 만들어 반환
const renderPreset =
  (key: keyof typeof PRESETS): NonNullable<S["render"]> =>
  (args) => {
    const preset = PRESETS[key];
    if (!preset) {
      return (
        <div style={{ padding: 16, color: "#D32F2F" }}>
          <strong>Missing preset:</strong> <code>{String(key)}</code>
        </div>
      );
    }

    // 이름 있는 래퍼 컴포넌트로 감싸기 (displayName 부여)
    const PresetCmp: React.FC<FilterBarProps> = (p) => <FilterBar {...p} />;
    PresetCmp.displayName = `FilterBarPreset_${String(key)}`;

    return <PresetCmp {...preset.props} {...(args as FilterBarProps)} />;
  };

// ▶ 개별 스토리
export const Apply_Basic: S = { name: "참가신청 / 기본", render: renderPreset("참가신청 / 기본") };
export const Apply_ApplicantManagement: S = { name: "참가신청 / 신청자관리", render: renderPreset("참가신청 / 신청자관리") };
export const Admin_Contest_Manage: S = { name: "관리자 / 대회관리", render: renderPreset("관리자 / 대회관리") };
export const Admin_Notice_Basic: S = { name: "관리자 / 공지사항(기본)", render: renderPreset("관리자 / 공지사항(기본)") };
export const Admin_Contest_Notice: S = { name: "관리자 / 대회_공지사항", render: renderPreset("관리자 / 대회_공지사항") };
export const Admin_Contest_Inquiry: S = { name: "관리자 / 대회_문의사항", render: renderPreset("관리자 / 대회_문의사항") };
export const Admin_Member_Personal: S = { name: "관리자 / 회원관리(개인)", render: renderPreset("관리자 / 회원관리(개인)") };
export const Admin_Member_Organization: S = { name: "관리자 / 회원관리(단체)", render: renderPreset("관리자 / 회원관리(단체)") };
export const Admin_Gallery_List: S = { name: "관리자 / 갤러리 리스트", render: renderPreset("관리자 / 갤러리 리스트") };
