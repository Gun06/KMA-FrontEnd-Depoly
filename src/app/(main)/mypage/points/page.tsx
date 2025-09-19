'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import { useEffect, useState } from 'react'
import SegmentedControl from '@/components/main/mypage/SegmentedControl'
import DateRangeInputs from '@/components/main/mypage/DateRangeInputs'

interface PointTransaction {
  id: string
  date: string
  description: string
  amount: number
}

// 실제 데이터 연동 전까지는 빈 배열로 두어 빈 상태 UI를 확인합니다.
const mockTransactions: PointTransaction[] = []

export default function MyPointsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 7

  const [selectedPeriod, setSelectedPeriod] = useState('1주일')
  const [startDate, setStartDate] = useState('2025.04.26')
  const [endDate, setEndDate] = useState('2025.07.26')

  const periods = ['1주일', '1개월', '3개월', '6개월']

  const pageCount = Math.max(1, Math.ceil(mockTransactions.length / pageSize))
  const paginated = mockTransactions.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [selectedPeriod, startDate, endDate])

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '마이페이지',
        subMenu: '포인트 현황'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h1 className="text-3xl font-giants-bold mb-2 text-black">
            <span className="text-blue-600">Run </span>
            Together, <span className="text-blue-600">Grow </span>Together!
          </h1>
          <p className="text-xl font-bold text-black">홍길동님!</p>
        </div>

        {/* 탭 네비게이션 */}
        <MypageTabs />

        {/* 필터 섹션 */}
        <div className="bg-gray-100 p-6 rounded-xl mt-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <SegmentedControl
              options={periods.map((p) => ({ key: p, label: p }))}
              value={selectedPeriod}
              onChange={(v) => setSelectedPeriod(v)}
            />
            <DateRangeInputs
              start={startDate}
              end={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>
        </div>

        {/* 섹션 타이틀 */}
        <div className="mt-8 mb-2">
          <h2 className="text-2xl font-giants-bold text-gray-900">포인트 현황</h2>
        </div>
        <div className="border-t border-gray-200 mb-2" />

        {/* 테이블 */}
        <div className="mt-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] sm:min-w-0 text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">날짜</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">적립내용</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">포인트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{t.date}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{t.description}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center font-semibold text-gray-900">
                      {t.amount > 0 ? `+${t.amount.toLocaleString()}P` : `${t.amount.toLocaleString()}P`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빈 상태 */}
        {mockTransactions.length === 0 && (
          <div className="py-16 text-center text-lg text-gray-800">포인트가 없습니다.</div>
        )}

        {/* 페이지네이션 */}
        {mockTransactions.length > pageSize && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </button>
              {Array.from({ length: pageCount }).map((_, idx) => {
                const num = idx + 1
                const isActive = num === page
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3 py-2 text-sm rounded ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
              <button
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </SubmenuLayout>
  )
}
