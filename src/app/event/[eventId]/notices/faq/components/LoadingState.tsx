import { EVENT_FAQ_PAGE_SHELL_CLASS } from '@/lib/layout/publicContentFrame';

interface LoadingStateProps {
  eventId: string;
}

export const LoadingState = ({ eventId: _eventId }: LoadingStateProps) => {
  return (
    <div className={`${EVENT_FAQ_PAGE_SHELL_CLASS} text-center`}>
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-gray-500" />
      <div className="mb-2 text-base text-gray-500 sm:text-lg">잠시만 기다려주세요</div>
      <div className="text-xs text-gray-400 sm:text-sm">FAQ를 불러오는 중입니다</div>
    </div>
  );
};
