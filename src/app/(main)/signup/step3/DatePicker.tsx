"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function DatePicker({ value, onChange, placeholder = "날짜를 선택하세요." }: DatePickerProps) {
  const [openDropdown, setOpenDropdown] = useState<'year' | 'month' | 'day' | null>(null)
  const yearRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)
  const dayRef = useRef<HTMLDivElement>(null)

  // 현재 선택된 날짜 파싱
  const parseDate = (dateString: string) => {
    if (!dateString) return { year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate() }
    
    const parts = dateString.split('.')
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0]) || new Date().getFullYear(),
        month: parseInt(parts[1]) - 1 || new Date().getMonth(),
        day: parseInt(parts[2]) || new Date().getDate()
      }
    }
    
    return { year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate() }
  }

  const currentDate = parseDate(value)

  const handleYearChange = (year: number) => {
    const formattedDate = `${year}.${String(currentDate.month + 1).padStart(2, '0')}.${String(currentDate.day).padStart(2, '0')}`
    onChange(formattedDate)
    setOpenDropdown(null)
  }

  const handleMonthChange = (month: number) => {
    const formattedDate = `${currentDate.year}.${String(month + 1).padStart(2, '0')}.${String(currentDate.day).padStart(2, '0')}`
    onChange(formattedDate)
    setOpenDropdown(null)
  }

  const handleDayChange = (day: number) => {
    const formattedDate = `${currentDate.year}.${String(currentDate.month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    onChange(formattedDate)
    setOpenDropdown(null)
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(event.target as Node) &&
          monthRef.current && !monthRef.current.contains(event.target as Node) &&
          dayRef.current && !dayRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center space-x-1">
      {/* 년도 선택 */}
      <div className="relative" ref={yearRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
          className="w-20 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
        >
          <span>{currentDate.year}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
        
        {openDropdown === 'year' && (
          <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                  year === currentDate.year ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 구분자 */}
      <span className="text-gray-400 text-sm mx-1">.</span>
      
      {/* 월 선택 */}
      <div className="relative" ref={monthRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
          className="w-16 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
        >
          <span>{String(currentDate.month + 1).padStart(2, '0')}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
        
        {openDropdown === 'month' && (
          <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <button
                key={month}
                onClick={() => handleMonthChange(month - 1)}
                className={`w-full px-3 py-2 text-sm text-center hover:bg-blue-50 transition-colors ${
                  month === currentDate.month + 1 ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {String(month).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 구분자 */}
      <span className="text-gray-400 text-sm mx-1">.</span>
      
      {/* 일 선택 */}
      <div className="relative" ref={dayRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
          className="w-16 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
        >
          <span>{String(currentDate.day).padStart(2, '0')}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
        
        {openDropdown === 'day' && (
          <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`w-full px-3 py-2 text-sm text-center hover:bg-blue-50 transition-colors ${
                  day === currentDate.day ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {String(day).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
