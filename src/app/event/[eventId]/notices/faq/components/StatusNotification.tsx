interface StatusNotificationProps {
  showFallback: boolean;
}

export const StatusNotification = ({ showFallback }: StatusNotificationProps) => {
  if (!showFallback) return null;

  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        <span className="text-sm text-yellow-700">
          실시간 FAQ 데이터를 불러올 수 없어 기본 FAQ를 표시합니다.
        </span>
      </div>
    </div>
  );
};
