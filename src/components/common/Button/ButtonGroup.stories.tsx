import type { Meta, StoryObj } from "@storybook/react";
import ButtonGroup from "./ButtonGroup";

const Frame: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="w-full flex justify-center">
    <div className="w-full max-w-[640px] px-6 py-8">{children}</div>
  </div>
);

const meta: Meta<typeof ButtonGroup> = {
  title: "UI/Button/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "padded" },
  argTypes: {
    size: { control: { type: "radio" }, options: ["lg", "md", "sm"] },
    left: { control: { type: "radio" }, options: ["prev", "cancel", null] },
    right: { control: { type: "radio" }, options: ["next", "submit"] },
    rightText: { control: "text" },
    widthMode: {
      control: { type: "radio" },
      options: ["fixed", "proportional", "fluid"],
    },
    onCancel: { action: "cancel clicked" },
    onPrev: { action: "prev clicked" },
    onNext: { action: "next clicked" },
    onSubmit: { action: "submit clicked" },
  },
  args: {
    size: "md",
    left: "prev",
    right: "next",
    widthMode: "fixed",
  },
  decorators: [(S) => <Frame><S /></Frame>],
  tags: ["autodocs"],
};

export default meta;
type S = StoryObj<typeof ButtonGroup>;

export const Docs: S = {};

export const Default: S = {};

export const Signup: S = {
  args: { left: "prev", right: "submit", rightText: "회원가입" },
};

export const CancelNext: S = {
  args: { left: "cancel", right: "next" },
};

export const AllSizes: S = {
  name: "Sizes (lg / md / sm)",
  render: (args) => (
    <div className="space-y-4">
      <ButtonGroup {...args} size="lg" />
      <ButtonGroup {...args} size="md" />
      <ButtonGroup {...args} size="sm" />
    </div>
  ),
};