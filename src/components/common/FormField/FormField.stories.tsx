// src/components/ui/FormField/FormField.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import FormField from "./FormField";
import TextField from "../TextField/TextField";
import { PhoneField } from "./PhoneField";
import { AddressField } from "./AddressField";
import { EmailField } from "./EmailField";
import PasswordField from "./PasswordField";
import IdCheckField from "./IdCheckField";
import BirthDateInput from "./BirthDateInput";

const meta: Meta<typeof FormField> = {
  title: "UI/FormField/Examples",
  component: FormField,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "largeDesktop" },
  },
  decorators: [
    (Story) => (
      // ✅ Docs/Canvas 모두에서 폭을 꽉 채운 뒤 flex로 중앙 정렬
      <div className="w-full flex justify-center">
        {/* 페이지 컨테이너(원하면 1200 → 1100 등 조절) */}
        <div className="w-[1200px] max-w-full p-8">
          {/* 폼 본문 폭 */}
          <div className="w-full max-w-[720px] mx-auto">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FormField>;

/** 단일 샘플들 – 스토리 내부에서는 폭/패딩 주지 않음 */
export const NameAndPassword: Story = {
  render: () => (
    <div className="space-y-6">
      <FormField label="이름" required>
        <TextField placeholder="이름(실명) 입력해주세요." />
      </FormField>
      <PasswordField />
      <PasswordField label="비밀번호 확인" placeholder="다시 입력해주세요." />
    </div>
  ),
};

export const PhoneOnly: Story = { render: () => <PhoneField /> };

export const AddressOnly: Story = { render: () => <AddressField /> };

export const EmailOnly: Story = { render: () => <EmailField /> };

export const IdOnly: Story = {
  name: "ID Only",
  render: () => <IdCheckField />,
};

export const BirthDateOnly: Story = {
  name: "BirthDate Only",
  render: () => (
    <div className="space-y-6">
      <FormField label="생년월일">
        <BirthDateInput placeholder="YYYY.MM.DD" />
      </FormField>
    </div>
  ),
};

/** 전체 섹션 */
export const FullSection: Story = {
  render: () => (
    <div className="space-y-6">
      <IdCheckField />
      <PasswordField />
      <PasswordField label="비밀번호 확인" placeholder="다시 입력해주세요." />
      <FormField label="이름" required>
        <TextField placeholder="이름(실명) 입력해주세요." />
      </FormField>
      <FormField label="생년월일">
        <BirthDateInput placeholder="YYYY.MM.DD" />
      </FormField>
      <PhoneField />
      <EmailField />
      <AddressField />
    </div>
  ),
};
