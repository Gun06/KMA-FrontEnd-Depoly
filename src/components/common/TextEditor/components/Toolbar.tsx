import React from 'react';
import type { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  ImageIcon, 
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MoveLeft,
  MoveRight,
  Circle
} from "lucide-react";
import type { TextEditorProps } from '../types';

interface ToolbarProps {
  editor: Editor;
  fontSize: string;
  textColor: string;
  onFontSizeChange: (size: string) => void;
  onTextColorChange: (color: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showFormatting?: boolean;
  showFontSize?: boolean;
  showTextColor?: boolean;
  showImageUpload?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  fontSize,
  textColor,
  onFontSizeChange,
  onTextColorChange,
  onImageUpload,
  showFormatting = true,
  showFontSize = true,
  showTextColor = true,
  showImageUpload = true,
}) => {
  return (
    <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* 실행 취소/다시 실행 */}
        <div className="flex items-center gap-1 mr-4">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="실행 취소"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="다시 실행"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-300" />

        {/* 서식 도구 */}
        {showFormatting && (
          <>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-md transition-colors ${
                editor.isActive("bold") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title="굵게"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-md transition-colors ${
                editor.isActive("italic") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title="기울임"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-md transition-colors ${
                editor.isActive("strike") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title="취소선"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </>
        )}

        {/* 텍스트 정렬 도구 */}
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => {
            editor.chain().focus().updateAttributes('paragraph', { textAlign: 'left' }).run();
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('textAlign', { textAlign: 'left' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="왼쪽 정렬"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            editor.chain().focus().updateAttributes('paragraph', { textAlign: 'center' }).run();
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('textAlign', { textAlign: 'center' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="가운데 정렬"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            editor.chain().focus().updateAttributes('paragraph', { textAlign: 'right' }).run();
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('textAlign', { textAlign: 'right' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="오른쪽 정렬"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            editor.chain().focus().updateAttributes('paragraph', { textAlign: 'justify' }).run();
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('textAlign', { textAlign: 'justify' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="양쪽 정렬"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        {/* 글씨 크기 도구 */}
        {showFontSize && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <select 
              value={fontSize}
              onChange={(e) => onFontSizeChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="default">기본</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          </>
        )}

        {/* 글씨 색상 도구 */}
        {showTextColor && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <select 
              value={textColor}
              onChange={(e) => onTextColorChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="default">기본</option>
              <option value="#000000">검정</option>
              <option value="#ef4444">빨강</option>
              <option value="#3b82f6">파랑</option>
              <option value="#22c55e">초록</option>
              <option value="#f59e0b">주황</option>
              <option value="#8b5cf6">보라</option>
              <option value="#ec4899">분홍</option>
              <option value="#6b7280">회색</option>
            </select>
          </>
        )}

        {/* 이미지 삽입 도구 */}
        {showImageUpload && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label 
              htmlFor="image-upload"
              className="cursor-pointer"
            >
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="이미지 삽입"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </label>
          </>
        )}

        {/* 이미지 정렬 도구 */}
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { align: 'left' });
            }
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('image', { align: 'left' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="이미지 왼쪽 정렬"
        >
          <MoveLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { align: 'center' });
            }
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('image', { align: 'center' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="이미지 가운데 정렬"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { align: 'right' });
            }
          }}
          className={`p-2 rounded-md transition-colors ${
            editor.isActive('image', { align: 'right' }) 
              ? "bg-blue-100 text-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="이미지 오른쪽 정렬"
        >
          <MoveRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
