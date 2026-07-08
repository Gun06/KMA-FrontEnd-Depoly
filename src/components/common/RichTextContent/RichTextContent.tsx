import React from 'react';
import clsx from 'clsx';

type RichTextContentVariant = 'default' | 'compact' | 'responsive' | 'responsiveCompact';

type RichTextContentProps = {
  html?: string;
  children?: React.ReactNode;
  variant?: RichTextContentVariant;
  className?: string;
  style?: React.CSSProperties;
};

const baseClasses =
  'prose max-w-none font-thin text-gray-600 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:tracking-tight [&_b]:tracking-tight';

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
  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={{ ...defaultStyle, ...style }}
      {...(html != null ? { dangerouslySetInnerHTML: { __html: html } } : {})}
    >
      {children}
    </div>
  );
}
