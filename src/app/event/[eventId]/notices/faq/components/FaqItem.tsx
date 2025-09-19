import Image from 'next/image';
import { DisplayFaqItem } from '../types';
import downIcon from '@/assets/icons/main/down.svg';
import upIcon from '@/assets/icons/main/up.svg';

interface FaqItemProps {
  item: DisplayFaqItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

export const FaqItem = ({ item, index, isOpen, onToggle }: FaqItemProps) => {
  const buttonId = `faq-button-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className="">
      <button
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={() => onToggle(index)}
        className="w-full flex items-center gap-4 py-4 sm:py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 px-4 sm:pl-0 sm:pr-0"
      >
        <span aria-hidden className="text-gray-800 font-giants text-[22px] md:text-[28px] leading-none">
          Q
        </span>
        <span className="flex-1 font-pretendard text-[16px] md:text-[18px] text-gray-900">
          {item.question}
        </span>
        <span aria-hidden>
          <Image
            src={isOpen ? upIcon : downIcon}
            alt=""
            width={16}
            height={16}
            className="w-4 h-4 md:w-5 md:h-5"
            priority={index < 3} // 첫 3개 아이템은 우선 로딩
          />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="pb-6 pl-4 pr-4 sm:pl-10 sm:pr-0"
      >
        <div className="mt-2 rounded-md bg-gray-100 p-4 md:p-6 min-h-[120px] md:min-h-[160px] text-gray-700 text-[14px] md:text-[16px] whitespace-pre-line">
          {item.answer}
        </div>
      </div>
    </div>
  );
};
