import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import PaginationBar from "./PaginationBar";
import Pagination from "./Pagination";

type Args = {
  page: number;
  total: number;
  pageSize: number;
  groupSize: number;
  showEdge: boolean;
};

const Frame: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="w-full flex justify-center">
    <div className="w-[1200px] max-w-full px-5 py-5 overflow-visible">{children}</div>
  </div>
);

const meta: Meta<Args> = {
  title: "UI/Pagination",
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "largeDesktop" },
  },
  args: {
    page: 1,
    total: 2997,
    pageSize: 10,
    groupSize: 10,
    showEdge: true,
  },
  decorators: [(S) => <Frame><S /></Frame>],
  tags: ["autodocs"],
};
export default meta;

type S = StoryObj<Args>;

// ✅ 내부 상태를 가지는 데모 컴포넌트들 (여기서만 Hook 사용)
const DemoBar: React.FC<Args> = (args) => {
  const [page, setPage] = React.useState(args.page);
  return (
    <div className="mt-4">
      <PaginationBar
        page={page}
        total={args.total}
        pageSize={args.pageSize}
        onChange={setPage}
        showNumbersInBar={false}
      />
    </div>
  );
};

const DemoPagination: React.FC<Args> = (args) => {
  const [page, setPage] = React.useState(args.page);
  return (
    <div className="mt-4 flex justify-center">
      <Pagination
        page={page}
        total={args.total}
        pageSize={args.pageSize}
        onChange={setPage}
        groupSize={args.groupSize}
        showEdge={args.showEdge}
      />
    </div>
  );
};

const DemoFull: React.FC<Args> = (args) => {
  const [page, setPage] = React.useState(args.page);
  return (
    <div className="mt-4 space-y-6">
      <PaginationBar
        page={page}
        total={args.total}
        pageSize={args.pageSize}
        onChange={setPage}
        showNumbersInBar={false}
      />
      <div className="flex justify-center">
        <Pagination
          page={page}
          total={args.total}
          pageSize={args.pageSize}
          onChange={setPage}
          groupSize={args.groupSize}
          showEdge={args.showEdge}
        />
      </div>
    </div>
  );
};

export const PaginationBarStory: S = { name: "PaginationBar", render: (args) => <DemoBar {...args} /> };
export const PaginationStory: S = { name: "Pagination", render: (args) => <DemoPagination {...args} /> };
export const FullStory: S = { name: "Full", render: (args) => <DemoFull {...args} /> };
