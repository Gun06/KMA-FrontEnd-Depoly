import { DisplayFaqItem } from './types';
import { FaqItem } from './FaqItem';

interface FaqListProps {
  faqItems: DisplayFaqItem[];
  isOpen: (index: number) => boolean;
  onToggle: (index: number) => void;
}

export const FaqList = ({ faqItems, isOpen, onToggle }: FaqListProps) => {
  return (
    <div>
      <p className="mb-3 text-xs text-gray-500 sm:mb-4 sm:text-sm">
        총 게시물{' '}
        <span className="font-medium text-gray-800">{faqItems.length}</span>건
      </p>
      {faqItems.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">등록된 FAQ가 없습니다.</p>
      ) : (
        <div className="divide-y divide-gray-200 rounded-md bg-white">
          {faqItems.map((item, index) => (
            <FaqItem
              key={`${index}-${item.question.slice(0, 24)}`}
              item={item}
              index={index}
              isOpen={isOpen(index)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
