'use client'

import { Calendar } from 'lucide-react'
import { useRef } from 'react'

interface DateRangeInputsProps {
  start: string
  end: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  className?: string
}

// YYYY.MM.DD -> YYYY-MM-DD 변환
function convertToDateInputFormat(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.replace(/\./g, '-')
}

// YYYY-MM-DD -> YYYY.MM.DD 변환
function convertToDisplayFormat(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.replace(/-/g, '.')
}

export default function DateRangeInputs({ start, end, onStartChange, onEndChange, className = '' }: DateRangeInputsProps) {
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  const inputBase = 'pl-4 pr-10 py-3 w-full bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  const openStartDatePicker = () => {
    const el = startDateRef.current as HTMLInputElement & { showPicker?: () => void } | null
    if (!el) return
    
    if (typeof el.showPicker === 'function') {
      el.showPicker()
    } else {
      el.focus()
      el.click()
    }
  }

  const openEndDatePicker = () => {
    const el = endDateRef.current as HTMLInputElement & { showPicker?: () => void } | null
    if (!el) return
    
    if (typeof el.showPicker === 'function') {
      el.showPicker()
    } else {
      el.focus()
      el.click()
    }
  }

  return (
    <div className={`flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center gap-3 w-full ${className}`}>
      <div className="relative w-full">
        <input 
          type="text" 
          value={start} 
          onChange={(e) => onStartChange(e.target.value)} 
          className={inputBase} 
        />
        {/* 네이티브 date input - 숨김 */}
        <input
          ref={startDateRef}
          type="date"
          className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
          value={convertToDateInputFormat(start)}
          onChange={(e) => {
            const v = e.currentTarget.value
            if (v) {
              onStartChange(convertToDisplayFormat(v))
            }
          }}
          aria-hidden
          tabIndex={-1}
        />
        <Calendar 
          className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-700 transition-colors" 
          onClick={openStartDatePicker}
          aria-hidden
        />
      </div>
      <span className="text-gray-500 text-center hidden sm:inline">~</span>
      <div className="relative w-full">
        <input 
          type="text" 
          value={end} 
          onChange={(e) => onEndChange(e.target.value)} 
          className={inputBase} 
        />
        {/* 네이티브 date input - 숨김 */}
        <input
          ref={endDateRef}
          type="date"
          className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
          value={convertToDateInputFormat(end)}
          onChange={(e) => {
            const v = e.currentTarget.value
            if (v) {
              onEndChange(convertToDisplayFormat(v))
            }
          }}
          aria-hidden
          tabIndex={-1}
        />
        <Calendar 
          className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-700 transition-colors" 
          onClick={openEndDatePicker}
          aria-hidden
        />
      </div>
    </div>
  )
}
