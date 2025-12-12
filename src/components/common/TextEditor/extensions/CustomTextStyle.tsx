import { TextStyle } from "@tiptap/extension-text-style";

/**
 * 커스텀 텍스트 스타일 확장
 * 폰트 크기 설정 기능을 제공합니다.
 */
export const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const v = (element as HTMLElement).style?.fontSize;
          return v ? v.replace(/['"]+/g, "") : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});
