'use client'

import { Calendar } from 'lucide-react'

interface DateRangeInputsProps {
  start: string
  end: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  className?: string
}

export default function DateRangeInputs({ start, end, onStartChange, onEndChange, className = '' }: DateRangeInputsProps) {
  const inputBase = 'pl-4 pr-10 py-3 w-full bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 w-full ${className}`}>
      <div className="relative w-full">
        <input type="text" value={start} onChange={(e) => onStartChange(e.target.value)} className={inputBase} />
        <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>
      <span className="text-gray-500">~</span>
      <div className="relative w-full">
        <input type="text" value={end} onChange={(e) => onEndChange(e.target.value)} className={inputBase} />
        <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
