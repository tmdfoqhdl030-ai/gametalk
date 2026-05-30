import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🎮</div>
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-xl font-bold text-gray-700 mb-2">페이지를 찾을 수 없어요</p>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          방이 닫혔거나, 잘못된 주소일 수 있어요.<br />
          홈으로 돌아가서 다시 팀원을 찾아보세요!
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors"
          >
            🏠 홈으로 가기
          </Link>
          <Link
            href="/rooms/new"
            className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-accent hover:text-accent transition-colors"
          >
            + 방 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
