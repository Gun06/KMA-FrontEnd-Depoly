export default function RecordsComingSoonPage() {
  return (
    <main className="mx-auto max-w-[1300px] px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200 py-16 px-6 shadow-sm">
        <div className="w-20 h-20 mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">서비스 준비중입니다</h1>
        <p className="text-gray-600 mb-2">
          참가자 기록 관리 기능을 준비하고 있습니다.
        </p>
      </div>
    </main>
  );
}


