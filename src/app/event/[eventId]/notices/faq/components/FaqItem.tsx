'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import downIcon from '@/assets/icons/main/down.svg';
import upIcon from '@/assets/icons/main/up.svg';
import { DisplayFaqItem } from '../types';
import { prepareHtmlForDisplay } from '@/components/common/TextEditor/utils/prepareHtmlForDisplay';

interface FaqItemProps {
  item: DisplayFaqItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

export const FaqItem = ({ item, index, isOpen, onToggle }: FaqItemProps) => {
  const buttonId = `faq-button-${index}`;
  const panelId = `faq-panel-${index}`;
  const questionCaption = `QUESTION ${String(index + 1).padStart(2, '0')}`;

  const questionHtml = useMemo(
    () => prepareHtmlForDisplay(item.question),
    [item.question]
  );
  const answerHtml = useMemo(
    () => prepareHtmlForDisplay(item.answer),
    [item.answer]
  );

  return (
    <div
      className={`rounded-lg transition-colors ${isOpen ? 'bg-white' : 'bg-gray-50/70'}`}
    >
      <button
        id={buttonId}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => onToggle(index)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-6 sm:py-5"
      >
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] tracking-[0.12em] text-gray-400">
            {questionCaption}
          </p>
          <span
            className="font-pretendard text-[15px] font-medium text-gray-800 sm:text-[16px] [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: questionHtml }}
          />
        </div>
        <span aria-hidden className="shrink-0 text-gray-500">
          <Image
            src={isOpen ? upIcon : downIcon}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
            priority={index < 3}
          />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="px-4 pb-5 sm:px-6"
      >
        <div
          className="mt-1 border-l-2 border-gray-200 pl-3 text-[14px] font-light leading-[1.7] text-gray-600 sm:pl-4 sm:text-[15px] [&_a]:text-blue-600 [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-4"
          dangerouslySetInnerHTML={{ __html: answerHtml }}
        />
      </div>
    </div>
  );
};
