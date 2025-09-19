import type { Meta, StoryObj } from "@storybook/react";
import Badge from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Ui/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded", // ← 왼쪽 기준 + 기본 패딩
    controls: { disable: true },
  },
  decorators: [
    // 가운데 정렬 제거. 컨테이너 폭만 적당히 제한
    (S) => (
      <div className="w-full py-12">
        <div className="w-full max-w-[720px] px-6">
          <S />
        </div>
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Badge>;
export const ApplicationStatus: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Badge kind="application" tone="primary">참가완료</Badge>
        <Badge kind="application" tone="success">접수완료</Badge>
        <Badge kind="application" tone="danger">접수취소</Badge>
      </div>
      <div className="flex gap-3">
        <Badge kind="application" tone="primary" size="md">참가완료</Badge>
        <Badge kind="application" tone="success" size="md">접수완료</Badge>
        <Badge kind="application" tone="danger" size="md">접수취소</Badge>
      </div>
      <div className="flex gap-3">
        <Badge kind="application" tone="primary" size="xs">참가완료</Badge>
        <Badge kind="application" tone="success" size="xs">접수완료</Badge>
        <Badge kind="application" tone="danger" size="xs">접수취소</Badge>
      </div>
    </div>
  ),
};

// RegistrationStatus
export const RegistrationStatus: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* 기본(sm) */}
      <div className="flex gap-3">
        <Badge kind="registration" tone="primary">접수중</Badge>
        <Badge kind="registration" tone="danger">비접수</Badge>
        <Badge kind="registration" tone="success">접수완료</Badge>
      </div>
      {/* 중간(md) */}
      <div className="flex gap-3">
        <Badge kind="registration" tone="primary" size="md">접수중</Badge>
        <Badge kind="registration" tone="danger" size="md">비접수</Badge>
        <Badge kind="registration" tone="success" size="md">접수완료</Badge>
      </div>
      {/* 작은(xs) */}
      <div className="flex gap-3">
        <Badge kind="registration" tone="primary" size="xs">접수중</Badge>
        <Badge kind="registration" tone="danger" size="xs">비접수</Badge>
        <Badge kind="registration" tone="success" size="xs">접수완료</Badge>
      </div>
    </div>
  ),
};

// Category
export const Category: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* 기본(sm) */}
      <div className="flex gap-3">
        <Badge kind="category" tone="primary">이벤트</Badge>
        <Badge kind="category" tone="neutral">공지</Badge>
        <Badge kind="category" tone="danger">대회</Badge>
      </div>
      {/* 중간(md) */}
      <div className="flex gap-3">
        <Badge kind="category" tone="primary" size="md">이벤트</Badge>
        <Badge kind="category" tone="neutral" size="md">공지</Badge>
        <Badge kind="category" tone="danger" size="md">대회</Badge>
      </div>
      {/* 작은(xs) */}
      <div className="flex gap-3">
        <Badge kind="category" tone="primary" size="xs">이벤트</Badge>
        <Badge kind="category" tone="neutral" size="xs">공지</Badge>
        <Badge kind="category" tone="danger" size="xs">대회</Badge>
      </div>
    </div>
  ),
};
