'use client'

import React from 'react'

interface SegmentedControlProps<T extends string> {
  options: { key: T; label: string }[]
  value: T
  onChange: (next: T) => void
  className?: string
  fullWidth?: boolean
}

export default function SegmentedControl<T extends string>({ options, value, onChange, className = '', fullWidth = false }: SegmentedControlProps<T>) {
  return (
    <div className={`inline-flex ${fullWidth ? 'w-full' : ''} bg-white border border-gray-300 rounded-xl overflow-hidden divide-x divide-gray-200 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`${fullWidth ? 'flex-1 text-center' : ''} px-6 py-3 text-sm whitespace-nowrap transition-colors ${
            value === opt.key ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
