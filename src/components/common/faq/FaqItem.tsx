import React, { memo, useMemo } from 'react';
import { PUBLIC_TAP_TARGET_MIN_CLASS } from '@/lib/layout/publicContentFrame';
import Image from 'next/image';
import downIcon from '@/assets/icons/main/down.svg';
import upIcon from '@/assets/icons/main/up.svg';
import { DisplayFaqItem } from './types';
import { prepareHtmlForDisplay } from '@/components/common/TextEditor/utils/prepareHtmlForDisplay';

interface FaqItemProps {
  item: DisplayFaqItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

export const FaqItem = memo(function FaqItem({ item, index, isOpen, onToggle }: FaqItemProps) {
  const buttonId = `faq-button-${index}`;
  const panelId = `faq-panel-${index}`;

  const questionHtml = useMemo(
    () => prepareHtmlForDisplay(item.question),
    [item.question]
  );
  const answerHtml = useMemo(
    () => prepareHtmlForDisplay(item.answer),
    [item.answer]
  );

  return (
    <div>
      <button
        id={buttonId}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => onToggle(index)}
        className={`flex w-full items-center gap-3 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:gap-4 sm:py-5 md:py-6 ${PUBLIC_TAP_TARGET_MIN_CLASS}`}
      >
        <span
          aria-hidden
          className="shrink-0 font-giants text-base font-bold leading-none text-gray-800 md:text-lg"
        >
          Q
        </span>
        <span
          className="min-w-0 flex-1 font-pretendard text-sm leading-relaxed text-gray-900 sm:text-base [&_p]:m-0 [&_p]:min-h-[1.25em] [&_p]:whitespace-pre-wrap [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: questionHtml }}
        />
        <span aria-hidden className="shrink-0">
          <Image
            src={isOpen ? upIcon : downIcon}
            alt=""
            width={20}
            height={20}
            className="h-4 w-4 md:h-5 md:w-5"
          />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="pb-4 sm:pb-5 md:pb-6"
      >
        <div
          className="mt-1 min-h-[100px] w-full rounded-md bg-gray-100 p-3 text-sm leading-relaxed text-gray-700 sm:mt-2 sm:p-4 sm:text-base md:min-h-[120px] md:p-5 [&_a]:text-blue-600 [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:m-0 [&_p]:min-h-[1.25em] [&_p]:whitespace-pre-wrap [&_p]:leading-relaxed [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-4"
          dangerouslySetInnerHTML={{ __html: answerHtml }}
        />
      </div>
    </div>
  );
});
