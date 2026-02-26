interface ErrorStateProps {
  eventId: string;
  error: string;
}

export const ErrorState = ({ eventId, error }: ErrorStateProps) => {
  return (
    <div className="w-full h-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-8 md:py-10 lg:py-12">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-2">오류가 발생했습니다</div>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    </div>
  );
};
