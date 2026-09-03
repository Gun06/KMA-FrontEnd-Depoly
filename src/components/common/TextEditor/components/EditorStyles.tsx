import React from 'react';

/**
 * 에디터 스타일 컴포넌트
 */
export const EditorStyles: React.FC = () => {
  return (
    <style jsx global>{`
      .image-container {
        clear: both;
      }
      .image-container img {
        max-width: 100%;
        height: auto;
        vertical-align: top;
      }
      .prose img {
        max-width: 100%;
        height: auto;
      }
      .ProseMirror {
        white-space: pre-wrap !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      .ProseMirror p {
        white-space: pre-wrap !important;
        margin: 0;
        min-height: 1.5em;
        line-height: 1.6;
      }
      .ProseMirror p:has(br) {
        min-height: 1.5em;
        white-space: pre-wrap !important;
      }
      .ProseMirror p:empty {
        min-height: 1.5em;
        white-space: pre-wrap !important;
      }
      /* 단락 내 모든 인라인 요소에서 개행 보존 (색상 포함) */
      .ProseMirror p span,
      .ProseMirror p strong,
      .ProseMirror p em,
      .ProseMirror p u,
      .ProseMirror p code {
        white-space: pre-wrap !important;
        display: inline;
      }
      /* 색상이 적용된 요소에서도 개행 보존 */
      .ProseMirror span[style*="color"] {
        white-space: pre-wrap !important;
        display: inline;
      }
      .ProseMirror a,
      .ProseMirror a.kma-editor-link {
        color: inherit;
        text-decoration: underline;
        text-decoration-color: currentColor;
        text-underline-offset: 2px;
        cursor: pointer;
      }
      /* 글자색이 안쪽 span에 있으면 밑줄도 그 색을 따름 */
      .ProseMirror a:not(.kma-editor-link--no-underline):has(span[style*="color"]) {
        text-decoration: none;
      }
      .ProseMirror a:not(.kma-editor-link--no-underline) span[style*="color"] {
        text-decoration: underline;
        text-decoration-color: currentColor;
        text-underline-offset: 2px;
      }
      .ProseMirror a.kma-editor-link--no-underline,
      .ProseMirror a.kma-editor-link--no-underline span[style*="color"] {
        text-decoration: none;
      }
      .ProseMirror[data-placeholder] p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #9ca3af;
        pointer-events: none;
        height: 0;
      }
    `}</style>
  );
};
