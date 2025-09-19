
import type { Meta, StoryObj, Decorator } from "@storybook/react";
import CompetitionCreateForm from "@/components/admin/Form/competition/CompetitionCreateForm";

const withPage: Decorator = (Story) => (
  <div className="min-h-screen bg-neutral-100 p-6">
    <div className="mx-auto w-full max-w-5xl">
      <Story />
    </div>
  </div>
);

const meta = {
  title: "Admin/Forms/CompetitionCreateForm",
  component: CompetitionCreateForm,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "largeDesktop" },
    docs: {
      description: {
        component: "대회 등록/배너/이미지 등록을 공통 FormTable/FormRow로 조립한 예시",
      },
    },
  },
  decorators: [withPage],
  tags: ["autodocs"],
} satisfies Meta<typeof CompetitionCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
