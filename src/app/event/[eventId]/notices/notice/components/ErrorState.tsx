interface ErrorStateProps {
  eventId: string;
  error: string;
}

export const ErrorState = ({ eventId, error }: ErrorStateProps) => {
  return (
    <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-2">오류가 발생했습니다</div>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    </div>
  );
};
