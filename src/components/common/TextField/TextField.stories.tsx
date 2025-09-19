// src/components/ui/TextField/TextField.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import TextField from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "UI/Form/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
### TextField 가이드

- **기본 규격**: size="md" → 16px / 높이 60px (FormRow 기본과 일치)
- **variant**
  - \`default\`: 테두리 있음 (strong/light)
  - \`flat\`: 테두리 없음 (2번 스타일)
- **사이즈 정책**
  1) 먼저 토큰(\`xs/sm/md/lg/xl\`)로 맞추세요.
  2) 꼭 필요할 때만 \`fontSizePx\`(예: 17/18/19) 또는 \`heightPx\`를 써서 예외 처리.
  3) \`heightPx\`를 바꿨다면 **FormRow의 \`rowHeight\`도 같은 값**으로 맞춰서 수직 정렬 유지.

> Tailwind purge 이슈를 피하기 위해 \`fontSizePx\`/\`heightPx\`는 inline style로 적용합니다.
      `,
      },
    },
  },
  args: {
    placeholder: "제목을 입력하세요",
    variant: "default",
    size: "md",
    borderTone: "strong",
    invalid: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "flat"],
      description: "렌더 스타일 (default=보더, flat=보더 없음)",
    },
    size: {
      control: { type: "inline-radio" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "토큰 기반 사이즈(권장). 기본 md=16px/60px",
    },
    fontSizePx: {
      control: { type: "number" },
      description: "예외: 임의 폰트 px (예: 17/18/19). 지정 시 토큰보다 우선",
      table: { defaultValue: { summary: "토큰 값" } },
    },
    heightPx: {
      control: { type: "number" },
      description: "예외: 인풋 높이 px. **FormRow.rowHeight도 동일 값으로 맞추세요**",
      table: { defaultValue: { summary: "토큰 값" } },
    },
    borderTone: {
      control: { type: "inline-radio" },
      options: ["strong", "light"],
      description: "variant=default에서만 적용",
    },
    invalid: { control: "boolean", description: "검증 에러 스타일" },
    disabled: { control: "boolean", description: "비활성화" },
    className: { table: { disable: true } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TextField>;

/** 컨트롤로 놀아보는 기본 플레이그라운드 */
export const Playground: Story = {};

/** 라이트 보더(variant=default에서만 의미 있음) */
export const LightBorder: Story = {
  args: { borderTone: "light" },
};

/** 에러 상태 */
export const Invalid: Story = {
  args: { invalid: true },
};

/** 보더 없는 플랫 스타일 (2번 스타일) */
export const Flat: Story = {
  args: { variant: "flat" },
};

/** 토큰 사이즈 모아보기 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, width: 360 }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
        <div key={s} style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, color: "#666" }}>size="{s}"</div>
          <TextField {...args} size={s} placeholder={`토큰: ${s}`} />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "프로젝트 기본은 **md(16px/60px)** 입니다. 우선 토큰으로 맞추세요.",
      },
    },
  },
};

/** 임의 폰트 17px (높이는 md 유지 60px) */
export const CustomFont17: Story = {
  args: { fontSizePx: 17, placeholder: "fontSizePx=17" },
  parameters: {
    docs: {
      description: {
        story: "행 높이 60px을 유지하면서 텍스트만 17px로 키운 예시.",
      },
    },
  },
};

/** 임의 폰트 19px + 높이 68px (FormRow도 rowHeight=68로 맞추세요) */
export const CustomFont19Tall: Story = {
  args: { fontSizePx: 19, heightPx: 68, placeholder: "19px / 68px" },
  parameters: {
    docs: {
      description: {
        story:
          "인풋 높이를 바꿨다면 **같은 행의 컨테이너(FormRow.rowHeight도 68)** 로 맞춰야 수직 정렬이 정확합니다.",
      },
    },
  },
};
