'use client'

interface ProfileInfoPanelProps {
  name?: string
  account?: string
  birth?: string
  gender?: string
  role?: string
  isLoading?: boolean
  statusText?: string
  unreadCountText?: string
  onEditClick?: () => void
}

export default function ProfileInfoPanel({
  name,
  account,
  birth,
  gender,
  role,
  isLoading = false,
  statusText = '활성',
  unreadCountText = '0건',
  onEditClick,
}: ProfileInfoPanelProps) {
  const displayBirth = birth ? birth.replace(/-/g, '.') : '-'
  const displayGender =
    gender === 'M' ? '남성' : gender === 'F' ? '여성' : gender || '-'

  return (
    <aside className="order-1">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">프로필 정보</h3>
        </div>

        {isLoading ? (
          <div className="px-4 py-4 space-y-3 text-sm animate-pulse">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={`profile-panel-skeleton-${index}`}
                className={`flex items-center justify-between gap-3 ${
                  index === 5 ? 'pt-2 border-t border-gray-200' : ''
                }`}
              >
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">이름</span>
              <span className="text-gray-800 font-medium text-right break-all">{name || account || '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">아이디</span>
              <span className="text-gray-800 font-medium text-right break-all">{account || '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">생년월일</span>
              <span className="text-gray-800 font-medium text-right break-all">{displayBirth}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">성별</span>
              <span className="text-gray-800 font-medium text-right break-all">{displayGender}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">권한</span>
              <span className="text-gray-800 font-medium text-right break-all">{role || '-'}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-3">
              <span className="text-gray-500">상태</span>
              <span className="text-gray-800 font-medium text-right break-all">{statusText}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">미읽음 알림</span>
              <span className="text-gray-800 font-medium text-right break-all">{unreadCountText}</span>
            </div>
          </div>
        )}

        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onEditClick}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            프로필 정보 수정
          </button>
        </div>
      </div>
    </aside>
  )
}
