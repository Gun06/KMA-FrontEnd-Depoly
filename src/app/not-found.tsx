export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-giants mb-4">404</h1>
        <h2 className="text-2xl font-giants mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="font-pretendard mb-4">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <a
          href="/"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
} 