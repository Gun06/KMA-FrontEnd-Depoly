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
      }
      .ProseMirror p {
        white-space: pre-wrap !important;
        margin: 0;
        min-height: 1.5em;
      }
      .ProseMirror p:has(br) {
        min-height: 1.5em;
      }
      .ProseMirror p:empty {
        min-height: 1.5em;
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
