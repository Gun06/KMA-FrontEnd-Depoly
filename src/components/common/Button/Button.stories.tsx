import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "padded" },
  argTypes: { onClick: { action: "button clicked" } },
  tags: ["autodocs"],
};
export default meta;

type S = StoryObj<typeof Button>;

/* === 사이즈 데모(배지처럼 토큰 3개) === */
export const Sizes: S = {
  name: "Sizes (lg / md / sm)",
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Button {...args} size="lg">Large 56</Button>
      <Button {...args} size="md">Medium 48</Button>
      <Button {...args} size="sm">Small 40</Button>
    </div>
  ),
  args: { tone: "primary" },
};

/* === 기존 버튼들 === */
export const DupCheck: S = {
  args: { children: "중복검사", size: "md", widthType: "phoneAuth", iconRight: true },
};

export const PhoneAuth: S = {
  name: "휴대폰 인증 (고정폭 162)",
  args: { children: "휴대폰 인증", size: "md", widthType: "phoneAuth", iconRight: true },
};

export const Zipcode: S = {
  name: "우편번호 찾기 (고정폭 162)",
  args: { children: "우편번호 찾기", size: "md", widthType: "zipcode", iconRight: true },
};

export const IdCheck: S = {
  args: { children: "아이디 확인", size: "md", widthType: "idCheck", iconRight: true },
};

export const Back: S = {
  args: { children: "뒤로가기", tone: "dark", size: "md", widthType: "pager" },
};

export const EditOutline: S = {
  args: { children: "수정", variant: "outline", tone: "outlineDark", size: "md", widthType: "pager" },
};

export const Register: S = {
  args: { children: "대회등록", tone: "primary", size: "md", widthType: "pager" },
};

export const DeleteDanger: S = {
  args: { children: "삭제하기", tone: "danger", size: "md", widthType: "pager" },
};

export const EditPrimary: S = {
  args: { children: "수정하기", tone: "primary", size: "md", widthType: "pager" },
};

/* === 관리 버튼 (초록/파랑) — 고정폭 + 아이콘 === */
export const ManageCompetitionNotice: S = {
  name: "대회사이트 공지사항 관리하기",
  args: {
    children: "대회사이트 공지사항 관리하기",
    tone: "competition",
    size: "md",
    className: "w-[280px] h-[48px]",
    iconRight: true,
  },
};

export const ManageKMANotice: S = {
  name: "전마협 사이트 공지사항 관리하기",
  args: {
    children: "전마협 사이트 공지사항 관리하기",
    tone: "primary",
    size: "md",
    className: "w-[280px] h-[48px]",
    iconRight: true,
  },
};

/* === 버튼 그룹 예시 === */
export const ManagementRow: S = {
  render: (args) => (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Button onClick={args.onClick} tone="dark" size="md" widthType="pager">뒤로가기</Button>
        <Button onClick={args.onClick} variant="outline" tone="outlineDark" size="md" widthType="pager">수정</Button>
        <Button onClick={args.onClick} tone="primary" size="md" widthType="pager">대회등록</Button>
      </div>
      <div className="flex gap-4">
        <Button onClick={args.onClick} tone="danger" size="md" widthType="pager">삭제하기</Button>
        <Button onClick={args.onClick} tone="primary" size="md" widthType="pager">수정하기</Button>
      </div>
    </div>
  ),
};
