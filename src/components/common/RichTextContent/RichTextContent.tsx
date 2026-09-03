import React from 'react';
import clsx from 'clsx';
import { ensureLinksOpenInNewTab } from '@/components/common/TextEditor/utils/prepareHtmlForDisplay';

type RichTextContentVariant = 'default' | 'compact' | 'responsive' | 'responsiveCompact';

type RichTextContentProps = {
  html?: string;
  children?: React.ReactNode;
  variant?: RichTextContentVariant;
  className?: string;
  style?: React.CSSProperties;
};

const baseClasses =
  'kma-rich-text prose max-w-none font-thin text-gray-600 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:tracking-tight [&_b]:tracking-tight';

const variantClasses: Record<RichTextContentVariant, string> = {
  default: '[&_p]:mb-2 [&_p:last-child]:mb-0',
  compact: '[&_p]:m-0 [&_p]:min-h-[1.5em] [&_p]:leading-[1.6]',
  responsive:
    'text-sm sm:text-base leading-relaxed break-words [&_p]:mb-2 [&_p:last-child]:mb-0',
  responsiveCompact:
    'text-sm sm:text-base leading-relaxed break-words [&_p]:m-0 [&_p]:min-h-[1.5em] [&_p]:leading-[1.6]',
};

const defaultStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontWeight: 100,
};

export function RichTextContent({
  html,
  children,
  variant = 'default',
  className,
  style,
}: RichTextContentProps) {
  const safeHtml = html != null ? ensureLinksOpenInNewTab(html) : undefined;

  return (
    <>
      <style>{`
        .kma-rich-text a {
          color: inherit;
          text-decoration: underline;
          text-decoration-color: currentColor;
          text-underline-offset: 2px;
          overflow-wrap: anywhere;
          word-break: break-all;
        }
        .kma-rich-text a:not(.kma-editor-link--no-underline):has(span[style*='color']) {
          text-decoration: none;
        }
        .kma-rich-text a:not(.kma-editor-link--no-underline) span[style*='color'] {
          text-decoration: underline;
          text-decoration-color: currentColor;
          text-underline-offset: 2px;
        }
        .kma-rich-text a.kma-editor-link--no-underline,
        .kma-rich-text a.kma-editor-link--no-underline span[style*='color'] {
          text-decoration: none;
        }
      `}</style>
      <div
        className={clsx(baseClasses, variantClasses[variant], className)}
        style={{ ...defaultStyle, ...style }}
        {...(safeHtml != null ? { dangerouslySetInnerHTML: { __html: safeHtml } } : {})}
      >
        {children}
      </div>
    </>
  );
}
