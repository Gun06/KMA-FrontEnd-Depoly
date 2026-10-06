import { DisplayFaqItem } from '../types';
import { FaqItem } from './FaqItem';

interface FaqListProps {
  faqItems: DisplayFaqItem[];
  isOpen: (index: number) => boolean;
  onToggle: (index: number) => void;
}

export const FaqList = ({ faqItems, isOpen, onToggle }: FaqListProps) => {
  if (faqItems.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">등록된 FAQ가 없습니다.</p>
    );
  }

  return (
    <div className="space-y-3 bg-transparent">
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
  );
};
