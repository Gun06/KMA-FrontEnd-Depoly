'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import { useEffect, useState } from 'react'
import SegmentedControl from '@/components/main/mypage/SegmentedControl'
import DateRangeInputs from '@/components/main/mypage/DateRangeInputs'

interface CertificateData {
  id: string
  eventName: string
  date: string
  time: string
  status: 'available' | 'pending' | 'expired'
}

const mockCertificates: CertificateData[] = [
  { id: '1', eventName: '런데이 7월 마라톤 [미션RUNDAY]', date: '2025.07.14', time: '02:45:33', status: 'available' },
  { id: '2', eventName: '2025순천야광레이스', date: '2025.07.14', time: '02:45:33', status: 'available' },
  { id: '3', eventName: '2025순천야광레이스', date: '2025.07.08', time: '02:45:33', status: 'available' },
]

const statusLabel: Record<CertificateData['status'], string> = {
  available: '발급완료',
  pending: '처리중',
  expired: '만료',
}

const statusClass: Record<CertificateData['status'], string> = {
  available: 'bg-blue-600 text-white',
  pending: 'bg-yellow-500 text-white',
  expired: 'bg-gray-400 text-white',
}

export default function MyCertificatesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1주일')
  const [startDate, setStartDate] = useState('2025.04.26')
  const [endDate, setEndDate] = useState('2025.07.26')
  const [page, setPage] = useState(1)
  const pageSize = 7

  const periods = ['1주일', '1개월', '3개월', '6개월']

  // 필터 변경 시 1페이지로 이동
  useEffect(() => {
    setPage(1)
  }, [selectedPeriod, startDate, endDate])

  const filtered = mockCertificates // 실제 구현 시 기간/날짜 필터 적용
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '마이페이지',
        subMenu: '기록증'
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
              fullWidth
            />
            <DateRangeInputs
              start={startDate}
              end={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              className="w-full"
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          *기록증은 대회 주최 측 처리 후 발급 가능합니다.
        </p>

        {/* 제목 */}
        <h2 className="text-2xl font-giants-bold text-gray-900 mb-3">기록증 조회</h2>

        {/* 모바일 카드 리스트 */}
        <div className="mt-2 sm:hidden space-y-3">
          {paginated.map((row) => (
            <div key={row.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">{row.date}</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">{row.eventName}</div>
                </div>
                <span className={`inline-flex items-center justify-center min-w-[64px] px-2 py-1 text-[10px] font-semibold rounded-md whitespace-nowrap ${statusClass[row.status]}`}>
                  {statusLabel[row.status]}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-sm">
                <div className="text-gray-500">기록</div>
                <div className="text-gray-900 truncate">{row.time}</div>
                <div className="text-gray-500">다운로드</div>
                <div className="text-gray-900">
                  <button className="text-gray-900 underline">[PDF 다운로드]</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 테이블 (태블릿 이상) */}
        <div className="mt-2 hidden sm:block">
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full min-w-[640px] sm:min-w-0 text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">일자</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">대회명</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">기록</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">발급상태</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">다운로드</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{row.date}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{row.eventName}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{row.time}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center whitespace-nowrap">
                      {statusLabel[row.status]}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">
                      <button className="text-gray-900 underline">[PDF 다운로드]</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
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
      </div>
    </SubmenuLayout>
  )
}
