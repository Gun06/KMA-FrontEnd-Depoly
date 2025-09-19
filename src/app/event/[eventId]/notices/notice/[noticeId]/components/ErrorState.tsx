import { BackButton } from './BackButton';

interface ErrorStateProps {
  eventId: string;
  error: string;
  onBack: () => void;
}

export const ErrorState = ({ eventId, error, onBack }: ErrorStateProps) => {
  return (
    <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
      <div className="text-center">
        <div className="text-red-500 text-base sm:text-lg mb-2">오류가 발생했습니다</div>
        <div className="text-xs sm:text-sm text-gray-400 break-words">{error}</div>
        <BackButton 
          onBack={onBack}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          목록으로 돌아가기
        </BackButton>
      </div>
    </div>
  );
};
