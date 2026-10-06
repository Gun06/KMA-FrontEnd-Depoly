import { EventBoardListFrame } from '@/components/event/notices/EventBoardListFrame';

interface ErrorStateProps {
  eventId: string;
  error: string;
}

export const ErrorState = ({ eventId, error }: ErrorStateProps) => {
  return (
    <EventBoardListFrame>
      <div className="text-center">
        <div className="text-red-500 text-lg mb-2">오류가 발생했습니다</div>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    </EventBoardListFrame>
  );
};
