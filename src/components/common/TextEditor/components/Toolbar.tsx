import React, { useState } from 'react';
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
  Circle,
  Link2,
  Unlink,
} from 'lucide-react';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import LinkModal, { type LinkModalSubmitPayload } from './LinkModal';

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
  showLink?: boolean;
  defaultTextColor?: string;
}

const LINK_CLASS = 'kma-editor-link';
const LINK_NO_UNDERLINE_CLASS = 'kma-editor-link--no-underline';

function linkHasUnderline(className: unknown): boolean {
  const cls = typeof className === 'string' ? className : '';
  return !cls.includes(LINK_NO_UNDERLINE_CLASS);
}

function buildLinkClass(underline: boolean): string {
  return underline ? LINK_CLASS : `${LINK_CLASS} ${LINK_NO_UNDERLINE_CLASS}`;
}

type LinkModalState = {
  open: boolean;
  from: number;
  to: number;
  url: string;
  underline: boolean;
  isEditing: boolean;
};

const INITIAL_LINK_MODAL: LinkModalState = {
  open: false,
  from: 0,
  to: 0,
  url: '',
  underline: true,
  isEditing: false,
};

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
  showLink = false,
  defaultTextColor = '#374151',
}) => {
  const [linkModal, setLinkModal] = useState<LinkModalState>(INITIAL_LINK_MODAL);
  const [linkNotice, setLinkNotice] = useState<string | null>(null);

  const openLinkModal = () => {
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    const isEditing = editor.isActive('link');

    if (!hasSelection && !isEditing) {
      setLinkNotice('링크를 걸 텍스트를 먼저 선택해 주세요.');
      return;
    }

    const attrs = editor.getAttributes('link');
    setLinkModal({
      open: true,
      from,
      to: isEditing && !hasSelection ? from : to,
      url: (attrs.href as string | undefined) || '',
      underline: linkHasUnderline(attrs.class),
      isEditing,
    });
  };

  const closeLinkModal = () => {
    setLinkModal(INITIAL_LINK_MODAL);
    editor.chain().focus().run();
  };

  const applyLink = ({ href, underline }: LinkModalSubmitPayload) => {
    const { from, to, isEditing } = linkModal;
    const chain = editor.chain().focus();
    if (from !== to) {
      chain.setTextSelection({ from, to });
    } else if (isEditing) {
      chain.extendMarkRange('link');
    }

    chain
      .setLink({
        href,
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: buildLinkClass(underline),
      })
      .run();

    setLinkModal(INITIAL_LINK_MODAL);
  };

  const removeLink = () => {
    const { from, to, isEditing } = linkModal;
    const chain = editor.chain().focus();
    if (from !== to) {
      chain.setTextSelection({ from, to });
    }
    if (isEditing || from !== to) {
      chain.extendMarkRange('link');
    }
    chain.unsetLink().run();
    setLinkModal(INITIAL_LINK_MODAL);
  };

  return (
    <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-4 flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="실행 취소"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="다시 실행"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {showFormatting && (
          <>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`rounded-md p-2 transition-colors ${
                editor.isActive('bold')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="굵게"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`rounded-md p-2 transition-colors ${
                editor.isActive('italic')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="기울임"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`rounded-md p-2 transition-colors ${
                editor.isActive('strike')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="취소선"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </>
        )}

        {showLink && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <button
              type="button"
              onClick={openLinkModal}
              className={`rounded-md p-2 transition-colors ${
                editor.isActive('link')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="링크"
            >
              <Link2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
              }
              disabled={!editor.isActive('link')}
              className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              title="링크 제거"
            >
              <Unlink className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="h-6 w-px bg-gray-300" />
        <button
          onClick={() => {
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { textAlign: 'left' })
              .run();
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('textAlign', { textAlign: 'left' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="왼쪽 정렬"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { textAlign: 'center' })
              .run();
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('textAlign', { textAlign: 'center' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="가운데 정렬"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { textAlign: 'right' })
              .run();
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('textAlign', { textAlign: 'right' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="오른쪽 정렬"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { textAlign: 'justify' })
              .run();
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('textAlign', { textAlign: 'justify' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="양쪽 정렬"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        {showFontSize && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <div className="relative">
              <select
                value={fontSize}
                onChange={(e) => onFontSizeChange(e.target.value)}
                className="min-w-[90px] cursor-pointer appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  fontSize: fontSize !== 'default' ? fontSize : '14px',
                }}
              >
                <option value="default">기본 (14px)</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="15px">15px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </>
        )}

        {showTextColor && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <div className="relative">
              <select
                value={textColor}
                onChange={(e) => {
                  onTextColorChange(e.target.value);
                }}
                className="min-w-[110px] cursor-pointer appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pl-8 pr-8 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  color: textColor !== 'default' ? textColor : defaultTextColor,
                }}
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
              <div
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-gray-300"
                style={{
                  backgroundColor:
                    textColor !== 'default' ? textColor : defaultTextColor,
                }}
              />
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </>
        )}

        {showImageUpload && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <button
                type="button"
                className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="이미지 삽입"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </label>
          </>
        )}

        <div className="h-6 w-px bg-gray-300" />
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { align: 'left' });
            }
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('image', { align: 'left' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="이미지 왼쪽 정렬"
        >
          <MoveLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { align: 'center' });
            }
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('image', { align: 'center' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="이미지 가운데 정렬"
        >
          <Circle className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (editor.isActive('image')) {
              editor.commands.updateAttributes('image', { align: 'right' });
            }
          }}
          className={`rounded-md p-2 transition-colors ${
            editor.isActive('image', { align: 'right' })
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="이미지 오른쪽 정렬"
        >
          <MoveRight className="h-4 w-4" />
        </button>
      </div>

      {showLink ? (
        <>
          <LinkModal
            isOpen={linkModal.open}
            initialUrl={linkModal.url}
            initialUnderline={linkModal.underline}
            isEditing={linkModal.isEditing}
            onClose={closeLinkModal}
            onSubmit={applyLink}
            onRemove={linkModal.isEditing ? removeLink : undefined}
          />
          <ErrorModal
            isOpen={!!linkNotice}
            onClose={() => setLinkNotice(null)}
            title="알림"
            message={linkNotice ?? ''}
            confirmText="확인"
            fitContent
          />
        </>
      ) : null}
    </div>
  );
};
