import React from 'react'

interface SectionPanelProps {
  title: string
  children?: React.ReactNode
  containerClassName?: string
  contentClassName?: string
  titleClassName?: string
  /** 타이틀이 시작되는 가로 오프셋(px, %, rem 등 CSS 값) */
  titleStart?: string
  showChevron?: boolean
  fullBleed?: boolean
  backgroundLayer?: React.ReactNode
}

export default function SectionPanel({
  title,
  children,
  containerClassName = '',
  contentClassName = '',
  titleClassName = '',
  titleStart,
  showChevron = true,
  fullBleed = false,
  backgroundLayer,
}: SectionPanelProps) {
  return (
    <div className={`relative overflow-hidden h-16 md:h-20 ${fullBleed ? 'rounded-none' : 'rounded-md'} ${containerClassName}`}>
      {backgroundLayer}
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 h-full">
        {/* Title */}
        <div
          className={`h-full flex items-center pl-6 md:pl-20 relative z-10 ${titleClassName}`}
          style={titleStart ? { paddingLeft: titleStart } : undefined}
        >
          <h2 className="font-giants text-[22px] md:text-[28px] text-gray-900 flex items-center">
            {title}
            {showChevron && (
              <span aria-hidden className="ml-1 text-[26px] md:text-[34px] leading-none relative -top-[1px] md:-top-[2px]">›</span>
            )}
          </h2>
        </div>

        {/* Content */}
        <div className={`py-3 md:py-4 relative z-10 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  )
}

