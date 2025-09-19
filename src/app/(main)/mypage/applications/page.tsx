'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import MypageTabs from '@/components/main/mypage/MypageTabs'
import { useState, useEffect } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'
import SegmentedControl from '@/components/main/mypage/SegmentedControl'
import DateRangeInputs from '@/components/main/mypage/DateRangeInputs'

interface ApplicationData {
  id: string
  date: string
  applicationNumber: string
  eventName: string
  option: string
  course: string
  status: 'completed' | 'registered' | 'cancelled'
}

const mockData: ApplicationData[] = [
  {
    id: '1',
    date: '2025.07.14',
    applicationNumber: '345678',
    eventName: '나이트 장수트레일레이스 38K-P',
    option: '옷/M',
    course: 'Half',
    status: 'completed'
  },
  {
    id: '2',
    date: '2025.07.08',
    applicationNumber: '345668',
    eventName: '런데이 7월 마라톤 [미션RUNDAY]',
    option: '신발/250',
    course: '5K',
    status: 'registered'
  },
  {
    id: '3',
    date: '2025.07.03',
    applicationNumber: '345658',
    eventName: '2025 전마협 별들의 전쟁 & 꽃들의 전쟁',
    option: '신발/290',
    course: 'Full',
    status: 'cancelled'
  },
  {
    id: '4',
    date: '2025.07.01',
    applicationNumber: '345638',
    eventName: '2025순천야광레이스',
    option: '옷/L',
    course: '10km',
    status: 'cancelled'
  }
]

const statusConfig = {
  completed: {
    label: '참가완료',
    className: 'bg-blue-600 text-white'
  },
  registered: {
    label: '접수완료',
    className: 'bg-green-600 text-white'
  },
  cancelled: {
    label: '접수취소',
    className: 'bg-red-600 text-white'
  }
}

export default function MyApplicationsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1주일')
  const [startDate, setStartDate] = useState('2025.04.26')
  const [endDate, setEndDate] = useState('2025.07.26')
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date')
  const [page, setPage] = useState(1)
  const pageSize = 7

  // 필터 변경 시 1페이지로 이동
  useEffect(() => {
    setPage(1)
  }, [selectedPeriod, startDate, endDate, sortBy])

  const pageCount = Math.max(1, Math.ceil(mockData.length / pageSize))
  const paginatedData = mockData.slice((page - 1) * pageSize, page * pageSize)

  const periods = ['1주일', '1개월', '3개월', '6개월']

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "마이페이지",
        subMenu: "마라톤 신청내역"
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
            {/* 기간 세그먼트 */}
            <SegmentedControl
              options={periods.map((p) => ({ key: p, label: p }))}
              value={selectedPeriod}
              onChange={(v) => setSelectedPeriod(v)}
              fullWidth
            />

            {/* 날짜 범위 입력 */}
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
          *주문번호를 클릭하시면 해당 주문에 대한 상세내역을 확인하실 수 있습니다.
        </p>

        {/* 신청내역 - 모바일 카드 리스트 */}
        <div className="mt-4 sm:hidden space-y-3">
          {paginatedData.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">{item.date} · 접수번호 {item.applicationNumber}</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">{item.eventName}</div>
                </div>
                <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-md ${statusConfig[item.status].className}`}>
                  {statusConfig[item.status].label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 text-sm">
                <div className="text-gray-500">옵션</div>
                <div className="text-gray-900 truncate">{item.option}</div>
                <div className="text-gray-500">코스</div>
                <div className="text-gray-900 truncate">{item.course}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 신청내역 테이블 (데스크탑/태블릿) */}
        <div className="mt-4 hidden sm:block">
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full min-w-[680px] sm:min-w-0 text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">날짜</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">접수번호</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">대회명</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">옵션</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">코스</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center font-medium text-gray-500">
                    <div className="flex items-center justify-center space-x-1">
                      <span>상태</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{item.date}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{item.applicationNumber}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{item.eventName}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{item.option}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-gray-900 text-center">{item.course}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center min-w-[64px] px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${statusConfig[item.status].className}`}
                      >
                        {statusConfig[item.status].label}
                      </span>
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
