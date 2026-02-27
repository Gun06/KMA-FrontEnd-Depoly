import { DisplayFaqItem } from '../types';
import { FaqItem } from './FaqItem';

interface FaqListProps {
  faqItems: DisplayFaqItem[];
  isOpen: (index: number) => boolean;
  onToggle: (index: number) => void;
}

export const FaqList = ({ faqItems, isOpen, onToggle }: FaqListProps) => {
  return (
    <div className="space-y-3 bg-transparent">
      {faqItems.map((item, index) => (
        <FaqItem
          key={index}
          item={item}
          index={index}
          isOpen={isOpen(index)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
