'use client'

import React from 'react'
import Image, { StaticImageData } from 'next/image'
import mailIcon from '@/assets/images/main/mail.png'
import callIcon from '@/assets/images/main/call.png'
import addressIcon from '@/assets/images/main/address.png'
import youtubeIcon from '@/assets/images/main/youtube.png'
import instagramIcon from '@/assets/images/main/instagram.png'
import SectionPanel from '@/components/main/SectionPanel'

type ContactItemType = 'email' | 'tel' | 'address' | 'youtube' | 'instagram'

interface ContactItem {
  type: ContactItemType
  title: string
  description?: string
  href?: string
}

// 아이콘을 파일로 사용 (Next Image)
const typeToIcon: Record<ContactItemType, { src: StaticImageData; alt: string }> = {
  email: { src: mailIcon, alt: '이메일' },
  tel: { src: callIcon, alt: '전화' },
  address: { src: addressIcon, alt: '주소' },
  youtube: { src: youtubeIcon, alt: 'YouTube' },
  instagram: { src: instagramIcon, alt: 'Instagram' },
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-transparent flex items-center justify-center">
      {children}
    </div>
  )
}

interface ContactSectionProps {
  // slate 배경이 시작되는 위치 (CSS 값 허용: '50%', '200px' 등)
  slateStart?: string
}

export default function ContactSection({ slateStart = '45%' }: ContactSectionProps) {
  const email = 'marathon@chungju.com'
  const telDisplay = '02) 417 - 1080'
  const telHref = '02-417-1080'
  const addressLine1 = '서울 송파구 방이동 백제고분로 501'
  const addressLine2 = '청호빌딩 302호'
  const mapQuery = encodeURIComponent('서울 송파구 방이동 백제고분로 501 청호빌딩 302호')
  const youtubeUrl = 'https://www.youtube.com/@jeonmahyeop'
  const instagramUrl = 'https://www.instagram.com/jeonmahyeop/'

  const items: ContactItem[] = [
    { type: 'email', title: 'E-mail', description: email, href: `mailto:${email}` },
    { type: 'tel', title: 'CALL', description: telDisplay, href: `tel:${telHref}` },
    { type: 'address', title: 'Address', description: `${addressLine1}\n${addressLine2}`, href: `https://maps.google.com/?q=${mapQuery}` },
    { type: 'youtube', title: 'YouTube', description: '유튜브 주소 바로가기 >', href: youtubeUrl },
    { type: 'instagram', title: 'Instagram', description: '인스타그램 주소 바로가기 >', href: instagramUrl },
  ]

  const renderIcon = (type: ContactItemType) => {
    const icon = typeToIcon[type]
    return (
      <Image
        src={icon.src}
        alt={icon.alt}
        width={80}
        height={80}
        className="w-16 h-16 md:w-20 md:h-20 object-contain"
        priority={false}
      />
    )
  }

  return (
    <section aria-labelledby="contact-us-title" className="bg-white">
      <div className="pt-10">
        <SectionPanel
          title="CONTACT US"
          fullBleed
          showChevron={false}
          titleClassName=""
        >
          {/* 빈 children으로 에러 방지 */}
        </SectionPanel>
        
        {/* Contact 내용을 SectionPanel 아래에 별도 배치 */}
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 relative">
          {/* slate 배경을 Contact 내용에도 적용 - 높이 확장 */}
          <div
            aria-hidden
            className="absolute inset-0 bg-slate-50"
            style={{ clipPath: `inset(30% 0 0 0)` }}
          />
          
          <div className="px-6 md:px-20 py-8 md:py-12 relative z-10">
            {/* 컨텐츠 */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-y-12 md:gap-y-16 gap-x-1 md:grid-cols-3 md:gap-x-2 lg:grid-cols-5 lg:gap-x-3 items-start relative z-10">
              {items.map((item) => (
                <div key={item.type} className="flex flex-col items-center gap-4 md:gap-5 text-center">
                  <IconBox>{renderIcon(item.type)}</IconBox>
                  <div className="font-giants text-[20px] md:text-[24px] text-gray-900">{item.title}</div>
                  {item.description && (
                    item.href ? (
                      <a
                        href={item.href}
                        target={item.type === 'youtube' || item.type === 'instagram' ? '_blank' : undefined}
                        rel={item.type === 'youtube' || item.type === 'instagram' ? 'noopener noreferrer' : undefined}
                        className="text-[14px] md:text-[16px] text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-pre-line"
                      >
                        {item.description}
                      </a>
                    ) : (
                      <span className="text-[14px] md:text-[16px] text-gray-600 whitespace-pre-line">
                        {item.description}
                      </span>
                    )
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

