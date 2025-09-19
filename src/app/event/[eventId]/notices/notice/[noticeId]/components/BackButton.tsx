import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const BackButton = ({ onBack, className = "", children }: BackButtonProps) => {
  return (
    <button
      onClick={onBack}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors ${className}`}
    >
      <ChevronLeft className="w-5 h-5" />
      <span>{children || '뒤로가기'}</span>
    </button>
  );
};
