interface LoadingStateProps {
  eventId: string;
}

export const LoadingState = ({ eventId }: LoadingStateProps) => {
  return (
    <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
        <div className="text-gray-500 text-lg mb-2">잠시만 기다려주세요</div>
        <div className="text-sm text-gray-400">공지사항을 불러오는 중입니다</div>
      </div>
    </div>
  );
};
