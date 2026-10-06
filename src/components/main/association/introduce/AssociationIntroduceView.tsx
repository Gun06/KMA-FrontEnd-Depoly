'use client';

import { useState } from 'react';
import Image from 'next/image';
import logoImage from '@/assets/images/main/logo.jpg';
import { mainBodyTextClass, mainSectionTitleClass } from '@/lib/main/typography';
import { OFFICES, type OfficeKey } from './offices';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
      <span className="h-2 w-2 shrink-0 bg-slate-800" aria-hidden />
      <h2 className={mainSectionTitleClass}>{children}</h2>
    </div>
  );
}

export function AssociationIntroduceView() {
  const [activeKey, setActiveKey] = useState<OfficeKey>('daejeon');
  const office = OFFICES.find((o) => o.key === activeKey) ?? OFFICES[0];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
      <p className={`border-l-4 border-slate-800 bg-slate-50/90 py-3 pl-4 pr-2 text-slate-700 ${mainBodyTextClass}`}>
        전국마라톤협회는 대전 본사를 중심으로 서울·영남 지사를 두고 전국 단위 대회 운영과 회원
        지원 업무를 수행하고 있습니다. 아래에서 사업장별 연락처와 찾아오시는 길을 확인하실 수
        있습니다.
      </p>

      <div
        className="mt-6 flex border-b border-slate-300 sm:mt-8"
        role="tablist"
        aria-label="사업장 선택"
      >
        {OFFICES.map((item) => {
          const selected = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveKey(item.key)}
              className={`relative flex-1 px-2 py-3 text-sm font-semibold transition-colors sm:px-4 sm:py-3.5 sm:text-base ${selected
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {item.tabLabel}
              {selected ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-800"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <article className="pt-6 sm:pt-8" role="tabpanel" aria-label={office.title}>
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:gap-6 sm:pb-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-slate-50 p-1 sm:h-16 sm:w-16">
            <Image
              src={logoImage}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">사단법인 전국마라톤협회</p>
            <h1 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">{office.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{office.role}</p>
          </div>
        </header>

        <div className="py-6 sm:py-8">
          <SectionHeading>기관 연락처</SectionHeading>
          <table className={`mt-4 w-full border-collapse text-left text-slate-800 ${mainBodyTextClass}`}>
            <caption className="sr-only">{office.title} 연락처</caption>
            <tbody>
              <tr className="border-b border-slate-200">
                <th
                  scope="row"
                  className="w-[28%] py-3 pr-4 font-semibold text-slate-600 sm:w-[7.5rem] sm:py-3.5"
                >
                  주소
                </th>
                <td className="py-3 leading-relaxed sm:py-3.5">{office.address}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <th scope="row" className="py-3 pr-4 font-semibold text-slate-600 sm:py-3.5">
                  전화
                </th>
                <td className="py-3 sm:py-3.5">{office.tel}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <th scope="row" className="py-3 pr-4 font-semibold text-slate-600 sm:py-3.5">
                  팩스
                </th>
                <td className="py-3 sm:py-3.5">{office.fax}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <th scope="row" className="py-3 pr-4 font-semibold text-slate-600 sm:py-3.5">
                  홈페이지
                </th>
                <td className="py-3 sm:py-3.5">
                  <a
                    href="https://www.run1080.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0B50D0] underline underline-offset-2 hover:text-[#083a9a]"
                  >
                    {office.homepage}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 sm:mt-10">
            <SectionHeading>찾아오시는 길</SectionHeading>
            <p className="mt-3 text-sm text-slate-600">{office.address}</p>
            <div className="mt-4 overflow-hidden rounded-sm bg-slate-100">
              <div className="h-[280px] w-full sm:h-[380px] lg:h-[420px]">
                <iframe
                  key={office.key}
                  src={office.mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={office.mapTitle}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
