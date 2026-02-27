'use client'

import React from 'react'
import Image from 'next/image'
import logoImage from '@/assets/images/main/logo.jpg'

interface OfficeRowProps {
  label: string
  address: string
  phone?: string
  fax?: string
}

const OFFICES: OfficeRowProps[] = [
  { label: '대전 본사', address: '대전광역시 대덕구 비래동 103-1 대동빌딩 2층', phone: '042) 638 - 1080', fax: '042) 638 - 1087' },
  { label: '서울지사', address: '서울 송파구 방이동 백제고분로 501 청호빌딩 302호', phone: '02) 417 - 1080' },
  { label: '영남지사', address: '경북 상주시 삼백로 60-9 향군회관 3층', phone: '054) 535 - 1080', fax: '054) 532 - 1082' },
  { label: '호남지사', address: '광주광역시 동구 문화전당로 23번길 5-20, 201호', phone: '062) 233 - 1080', fax: '062) 233 - 1082' },
]

const POLICY_LINKS: { href: string; label: string; shortLabel: string }[] = [
  { href: '/terms', label: '이용약관', shortLabel: '이용약관' },
  { href: '/privacy', label: '개인정보취급방침', shortLabel: '개인정보' },
  { href: '/email-policy', label: '이메일 주소 무단 수집 거부', shortLabel: '이메일거부' },
]

function OfficeRow({ label, address, phone, fax }: OfficeRowProps) {
  return (
    <div className="grid grid-cols-1 md:[grid-template-columns:minmax(0,1fr)_auto_auto] gap-x-3 gap-y-1 items-start text-gray-400 text-[11px] md:text-[13px] leading-relaxed">
      <div className="md:pr-3">
        <span className="text-gray-400 font-medium mr-1">{label}</span>
        <span className="mx-1">:</span>
        <span>{address}</span>
      </div>
      <div className="text-left whitespace-nowrap md:border-l md:border-gray-300 md:pl-6">
        {phone && (
          <>
            <span className="text-gray-400 mr-2">전화</span>
            <span className="tabular-nums whitespace-nowrap">{phone}</span>
          </>
        )}
      </div>
      <div className="text-left whitespace-nowrap md:border-l md:border-gray-300 md:pl-6">
        {fax && (
          <>
            <span className="text-gray-400 mr-2">팩스</span>
            <span className="tabular-nums whitespace-nowrap">{fax}</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminFooter() {
  return (
    <footer className="bg-white text-gray-800">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 py-6 md:py-7">
        <div className="w-full md:mx-auto md:w-fit pl-2 md:pl-0">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-start">
            <div className="flex-shrink-0 flex items-start self-start gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-green-600 overflow-hidden flex items-center justify-center bg-white">
                <Image src={logoImage} alt="전국마라톤협회 로고" width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div className="leading-tight select-none">
                <div className="font-giants text-[18px] md:text-[20px] text-gray-900 break-keep">전/마/협</div>
                <div className="font-pretendard text-[12px] md:text-[14px] text-gray-400 break-keep">전국마라톤협회</div>
              </div>
            </div>
            <div className="flex-none">
              <h3 className="font-pretendard font-bold text-gray-900 text-[13px] md:text-[14px] break-keep">전국마라톤협회</h3>
              <div className="mt-2.5 text-gray-400 text-[11px] md:text-[13px] leading-relaxed break-keep">
                <span>사업자 등록번호</span>
                <span className="mx-1">:</span>
                <span className="tabular-nums whitespace-nowrap">215-82-66070</span>
                <span className="mx-2">|</span>
                <span>대표</span>
                <span className="mx-1">:</span>
                <span>장영기</span>
                <span className="mx-2">|</span>
                <span>통신판매신고</span>
                <span className="mx-1">:</span>
                <span className="tabular-nums whitespace-nowrap">2014-대전대덕-0082호</span>
              </div>
              <div className="mt-3 text-[12px] md:text-[14px] leading-relaxed text-gray-400">
                <div className="hidden md:inline-grid md:grid-cols-[max-content_max-content_max-content] md:gap-x-6 md:items-start">
                  <div className="space-y-1.5 pr-0">
                    {OFFICES.map((office) => (
                      <p key={office.label} className="whitespace-normal">
                        <span className="text-gray-400 font-medium mr-1">{office.label}</span>
                        <span className="mx-1">:</span>
                        {office.address}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-1.5 md:pl-6">
                    {OFFICES.map((office) => (
                      <p key={office.label}>
                        {office.phone ? (
                          <>
                            <span className="text-gray-400 mr-2">전화</span>
                            <span className="tabular-nums whitespace-nowrap">{office.phone}</span>
                          </>
                        ) : (
                          <span className="opacity-0">-</span>
                        )}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-1.5 md:pl-6">
                    {OFFICES.map((office) => (
                      <p key={office.label}>
                        {office.fax ? (
                          <>
                            <span className="text-gray-400 mr-2">팩스</span>
                            <span className="tabular-nums whitespace-nowrap">{office.fax}</span>
                          </>
                        ) : (
                          <span className="opacity-0">-</span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="md:hidden space-y-1.5">
                  {OFFICES.map((office) => (
                    <OfficeRow
                      key={office.label}
                      label={office.label}
                      address={office.address}
                      phone={office.phone}
                      fax={office.fax}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-gray-200 mx-auto" />
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-col items-center space-y-3">
          <p className="text-[12px] md:text-[13px] text-gray-400">© 2025 RUN1080 Inc. ALL RIGHT RESERVED.</p>
          <div className="flex items-center gap-3 md:gap-10 text-[13px] md:text-[14px] whitespace-nowrap">
            {POLICY_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-gray-700 hover:text-gray-900 py-1" aria-label={link.label}>
                <span className="md:hidden">{link.shortLabel}</span>
                <span className="hidden md:inline">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

