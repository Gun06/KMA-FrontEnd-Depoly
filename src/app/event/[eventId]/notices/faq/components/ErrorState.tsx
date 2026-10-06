import { FaqPageFrame } from './FaqPageFrame';

interface ErrorStateProps {
  eventId: string;
  error: string;
}

export const ErrorState = ({ eventId: _eventId, error }: ErrorStateProps) => {
  return (
    <FaqPageFrame>
      <div className="py-16 text-center">
        <p className="mb-2 text-base text-[#e11d24] sm:text-lg">오류가 발생했습니다</p>
        <p className="break-words text-xs text-neutral-500 sm:text-sm">{error}</p>
      </div>
    </FaqPageFrame>
  );
};
