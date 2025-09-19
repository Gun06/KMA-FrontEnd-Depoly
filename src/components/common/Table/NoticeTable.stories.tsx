// src/components/ui/Table/NoticeTable.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import NoticeTable from "./NoticeTable";
import { noticeData } from "@/data/notices";

const Frame: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="w-full flex justify-center">
    <div className="w-full max-w-[1200px] px-5 py-5">
      <div className="md:min-w-[1100px]">{children}</div>
    </div>
  </div>
);

const meta: Meta<typeof NoticeTable> = {
  title: "UI/Tables/NoticeTable",
  component: NoticeTable,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "largeDesktop" },
    docs: { source: { state: "open" } },
  },
  args: {
    data: noticeData,
    pinLimit: 3,
    numberDesc: true,
    showPinnedBadgeInNo: true,
    pinnedClickable: true,
  },
  argTypes: {
    onRowClick: { action: "row-click" },
    pinLimit: { control: { type: "number", min: 0, max: 10, step: 1 } },
    numberDesc: { control: "boolean" },
    showPinnedBadgeInNo: { control: "boolean" },
    pinnedClickable: { control: "boolean" },
  },
  decorators: [(S) => <Frame><S /></Frame>],
  tags: ["autodocs"],
};
export default meta;

type S = StoryObj<typeof NoticeTable>;

export const Desktop: S = {};

/** ✅ Tablet(768) */
export const Tablet: S = {
  name: "Tablet (768)",
  parameters: { viewport: { defaultViewport: "tablet768" } },
};

export const Mobile: S = {
  parameters: { viewport: { defaultViewport: "mobile375" } },
  decorators: [
    (S) => (
      <div className="w-full px-4 py-4 overflow-x-hidden">
        <S />
      </div>
    ),
  ],
};
