import { FaqPageFrame } from './FaqPageFrame';

interface FaqErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function FaqErrorState({ error, onRetry }: FaqErrorStateProps) {
  return (
    <FaqPageFrame>
      <div className="py-16 text-center">
        <p className="mb-2 text-base text-[#e11d24] sm:text-lg">오류가 발생했습니다</p>
        <p className="break-words text-xs text-neutral-500 sm:text-sm">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            다시 시도
          </button>
        ) : null}
      </div>
    </FaqPageFrame>
  );
}
