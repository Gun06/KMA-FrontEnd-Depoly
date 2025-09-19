import type { Meta, StoryObj } from "@storybook/react";
import HeroButton from "./HeroButton";

const meta: Meta<typeof HeroButton> = {
  title: "UI/Button/HeroButtons",
  component: HeroButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**HeroButton** 컴포넌트  
- variant: main / competition  
- tone: white, black, blue, darkGray  
- size: lg(기본), md, sm  
- 순서: lg → md → sm  
        `,
      },
    },
  },
};
export default meta;

export const MainButtons: StoryObj<typeof HeroButton> = {
  render: () => (
    <div className="flex flex-col gap-6 bg-[#D9D9D9] p-6">
      {/* lg */}
      <div className="flex gap-4">
        <HeroButton variant="main" tone="white" size="lg">대회요강</HeroButton>
        <HeroButton variant="main" tone="black" size="lg">참가신청</HeroButton>
        <HeroButton variant="main" tone="white" size="lg">공지사항</HeroButton>
      </div>
      {/* md */}
      <div className="flex gap-4">
        <HeroButton variant="main" tone="white" size="md">대회요강</HeroButton>
        <HeroButton variant="main" tone="black" size="md">참가신청</HeroButton>
        <HeroButton variant="main" tone="white" size="md">공지사항</HeroButton>
      </div>
      {/* sm */}
      <div className="flex gap-4">
        <HeroButton variant="main" tone="white" size="sm">대회요강</HeroButton>
        <HeroButton variant="main" tone="black" size="sm">참가신청</HeroButton>
        <HeroButton variant="main" tone="white" size="sm">공지사항</HeroButton>
      </div>
    </div>
  ),
};

export const CompetitionButtons: StoryObj<typeof HeroButton> = {
  render: () => (
    <div className="flex flex-col gap-6 bg-[#D9D9D9] p-6">
      {/* lg */}
      <div className="flex gap-4">
        <HeroButton variant="competition" tone="blue" size="lg">신청 하기</HeroButton>
        <HeroButton variant="competition" tone="darkGray" size="lg">대회 요강</HeroButton>
        <HeroButton variant="competition" tone="darkGray" size="lg">신청 확인</HeroButton>
      </div>
      {/* md */}
      <div className="flex gap-4">
        <HeroButton variant="competition" tone="blue" size="md">신청 하기</HeroButton>
        <HeroButton variant="competition" tone="darkGray" size="md">대회 요강</HeroButton>
        <HeroButton variant="competition" tone="darkGray" size="md">신청 확인</HeroButton>
      </div>
      {/* sm */}
      <div className="flex gap-4">
        <HeroButton variant="competition" tone="blue" size="sm">신청 하기</HeroButton>
        <HeroButton variant="competition" tone="darkGray" size="sm">대회 요강</HeroButton>
        <HeroButton variant="competition" tone="darkGray" size="sm">신청 확인</HeroButton>
      </div>
    </div>
  ),
};
