"use client";

import React from "react";
import { EditorContent } from "@tiptap/react";
import { useTextEditor } from "./hooks/useTextEditor";
import { Toolbar, EditorStyles } from "./components";
import type { TextEditorProps } from "./types";

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = "",
  height = "400px",
  showFormatting = true,
  showFontSize = true,
  showTextColor = true,
  showImageUpload = true,
  imageDomainType = 'NOTICE',
  imageServerType = 'admin',
  placeholder = "내용을 작성해주세요...",
  onChange,
  onEditorReady,
}) => {
  const {
    editor,
    isMounted,
    fontSize,
    textColor,
    handleImageUpload,
    setFontSizeHandler,
    setTextColorHandler,
  } = useTextEditor({
    initialContent,
    placeholder,
    onChange,
    onEditorReady,
    imageDomainType,
    imageServerType,
  });

  // 클라이언트 사이드에서만 에디터 렌더링
  if (!isMounted || !editor) {
    return (
      <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-center h-32 text-gray-500">
            에디터를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* 툴바 */}
      <Toolbar
        editor={editor}
        fontSize={fontSize}
        textColor={textColor}
        onFontSizeChange={setFontSizeHandler}
        onTextColorChange={setTextColorHandler}
        onImageUpload={handleImageUpload}
        showFormatting={showFormatting}
        showFontSize={showFontSize}
        showTextColor={showTextColor}
        showImageUpload={showImageUpload}
      />

      {/* 에디터 영역 */}
      <div
        className="bg-white"
        style={{ minHeight: height }}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none"
        />
        <EditorStyles />
      </div>
    </div>
  );
};

export default React.memo(TextEditor);
export type { TextEditorProps } from './types';
