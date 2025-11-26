interface LoadingStateProps {
  eventId: string;
}

export const LoadingState = ({ eventId }: LoadingStateProps) => {
  return (
    <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500 mx-auto mb-4"></div>
        <div className="text-gray-500 text-base sm:text-lg mb-2">잠시만 기다려주세요</div>
        <div className="text-xs sm:text-sm text-gray-400">FAQ를 불러오는 중입니다</div>
      </div>
    </div>
  );
};
