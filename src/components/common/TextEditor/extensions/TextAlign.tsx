import { TextStyle } from "@tiptap/extension-text-style";

/**
 * 텍스트 정렬 기능 확장
 * 텍스트 정렬 기능을 제공합니다.
 */
export const TextAlign = TextStyle.extend({
  name: 'textAlign',
  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          textAlign: {
            default: 'left',
            parseHTML: (element: HTMLElement) => element.style.textAlign || 'left',
            renderHTML: (attributes: { textAlign?: string }) => {
              if (!attributes.textAlign || attributes.textAlign === 'left') {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },
});
