import React, { useMemo } from 'react';
import Image from 'next/image';
import { DisplayFaqItem } from '../types';
import downIcon from '@/assets/icons/main/down.svg';
import upIcon from '@/assets/icons/main/up.svg';
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

  return (
    <div className={`rounded-lg transition-colors ${isOpen ? 'bg-white' : 'bg-gray-50/70'}`}>
      <button
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => onToggle(index)}
        className="w-full flex items-center gap-3 py-4 sm:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 px-4 sm:px-6"
      >
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.12em] text-gray-400 mb-1">{questionCaption}</p>
          <span
            className="font-pretendard text-[15px] sm:text-[16px] font-medium text-gray-800 [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: useMemo(() => prepareHtmlForDisplay(item.question), [item.question]) }}
          />
        </div>
        <span aria-hidden className="text-gray-500">
          <Image
            src={isOpen ? upIcon : downIcon}
            alt=""
            width={16}
            height={16}
            className="w-4 h-4"
            priority={index < 3} // 첫 3개 아이템은 우선 로딩
          />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="pb-5 px-4 sm:px-6"
      >
        <div 
          className="mt-1 pl-3 sm:pl-4 border-l-2 border-gray-200 text-gray-600 text-[14px] sm:text-[15px] font-light [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:leading-[1.7] [&_p+p]:mt-2"
          dangerouslySetInnerHTML={{ __html: useMemo(() => prepareHtmlForDisplay(item.answer), [item.answer]) }}
        />
      </div>
    </div>
  );
};
