import React from 'react'
import Image from 'next/image'
import logoImage from '@/assets/images/main/logo.jpg'
import { useMainBanner } from '@/components/providers/MainBannerContext';

interface EventFooterProps {
  footerBgClass?: string
  accentColor?: string
}

export default function EventFooter({ footerBgClass, accentColor }: EventFooterProps) {
  const { mainBannerColor } = useMainBanner();
  
  // 우선순위: prop > context > 기본값
  const backgroundColor = accentColor || mainBannerColor || '#000000';

  return (
    <footer 
      className={`${footerBgClass ?? 'bg-black'} text-white`}
      style={{ 
        backgroundColor: footerBgClass ? undefined : backgroundColor
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full ring-2 ring-green-600 overflow-hidden flex items-center justify-center bg-white shrink-0">
            <Image src={logoImage} alt="전국마라톤협회 로고" width={48} height={48} className="object-cover w-full h-full" />
          </div>
          <div className="text-[11px] min-[1000px]:text-[12px] leading-5 min-[1000px]:leading-6 text-white/70">
            <div>전국마라톤협회</div>
            <div>
              사업자 등록번호: <span className="tabular-nums">215-82-66070</span>
              <span className="mx-2">|</span>
              대표: 장영기
              <span className="mx-2">|</span>
              통신판매신고: <span className="tabular-nums">2014-대전대덕-0082호</span>
            </div>
            <div>
              대전 본사: 대전광역시 대덕구 비래동 103-1 대동빌딩 2층
              <span className="mx-2">|</span>
              전화 <span className="tabular-nums">042) 638 - 1080</span>
              <span className="mx-2">|</span>
              팩스 <span className="tabular-nums">042) 638 - 1087</span>
              <span className="mx-2">|</span>
              이메일 : <span>jeonmahyeop@naver.com</span>
            </div>
            <div className="text-white/50">© 2025 RUN1080 Inc. ALL RIGHT RESERVED.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

