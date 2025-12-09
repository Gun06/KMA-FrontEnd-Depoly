'use client';

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import { useState } from 'react'
import Image from 'next/image'
import logoImage from '@/assets/images/main/logo.jpg'

export default function IntroducePage() {
  const [activeTab, setActiveTab] = useState('daejeon')

  const officeData = {
    daejeon: {
      title: "전마협 대전본사",
      address: "대전시 대덕구 비래동 103-1 대동빌딩 2층",
      tel: "042) 638-1080",
      fax: "042) 638-1087",
      homepage: "WWW.RUN1080.COM"
    },
    yeongnam: {
      title: "전마협 영남지사",
      address: "경상북도 상주시 낙양동 146-110",
      tel: "054) 535-1080",
      fax: "054) 531-1082",
      homepage: "WWW.RUN1080.COM"
    },
    seoul: {
      title: "전마협 서울지사",
      address: "서울 송파구 방이동 백제고분로 501 청호빌딩 302호",
      tel: "02) 417-1080",
      fax: "02) 417-1082",
      homepage: "WWW.RUN1080.COM"
    }
  }

  const activeOffice = officeData[activeTab as keyof typeof officeData]

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "전마협",
        subMenu: "협회 소개"
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* 탭 네비게이션 */}
        <div className="bg-gray-100 rounded-lg p-2 pb-0 inline-block relative z-0 ml-auto ml-5">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('daejeon')}
              className={`px-4 py-2 text-sm font-bold transition-colors duration-200 relative ${
                activeTab === 'daejeon'
                  ? 'text-black'
                  : 'text-black'
              }`}
            >
              대전 본사
              {activeTab === 'daejeon' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" style={{ bottom: '-1px' }}></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('yeongnam')}
              className={`px-4 py-2 text-sm font-bold transition-colors duration-200 relative ${
                activeTab === 'yeongnam'
                  ? 'text-black'
                  : 'text-black'
              }`}
            >
              영남 지사
              {activeTab === 'yeongnam' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" style={{ bottom: '-1px' }}></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('seoul')}
              className={`px-4 py-2 text-sm font-bold transition-colors duration-200 relative ${
                activeTab === 'seoul'
                  ? 'text-black'
                  : 'text-black'
              }`}
            >
              서울 지사
              {activeTab === 'seoul' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" style={{ bottom: '-1px' }}></div>
              )}
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 relative">
          {/* 로고 섹션 - 오른쪽 상단 */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-green-600 overflow-hidden flex items-center justify-center bg-white">
              <Image src={logoImage} alt="전국마라톤협회 로고" width={32} height={32} className="object-cover w-full h-full sm:w-10 sm:h-10" />
            </div>
            <div className="leading-tight select-none">
              <div className="font-giants text-[12px] sm:text-[14px] lg:text-[16px] text-gray-900 break-keep">전/마/협</div>
              <div className="font-pretendard text-[10px] sm:text-[11px] lg:text-[12px] text-gray-400 break-keep">전국마라톤협회</div>
            </div>
          </div>

          {/* 헤더 섹션 */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-[#ECF2FE] rounded-lg px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 inline-block">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#0B50D0]">
                {activeOffice.title}
              </h1>
            </div>
            
            {/* 연락처 정보 */}
            <div className="space-y-3 sm:space-y-4 text-gray-700 mt-6 sm:mt-8">
              <div className="grid grid-cols-[80px_20px_auto] sm:grid-cols-[120px_20px_auto] items-center text-sm sm:text-base">
                <span className="font-semibold text-gray-600 text-left">주소</span>
                <span className="text-gray-600">:</span>
                <span className="ml-1 sm:ml-2">{activeOffice.address}</span>
              </div>
              <div className="grid grid-cols-[80px_20px_auto] sm:grid-cols-[120px_20px_auto] items-center text-sm sm:text-base">
                <span className="font-semibold text-gray-600 text-left">TEL</span>
                <span className="text-gray-600">:</span>
                <span className="ml-1 sm:ml-2">{activeOffice.tel}</span>
              </div>
              <div className="grid grid-cols-[80px_20px_auto] sm:grid-cols-[120px_20px_auto] items-center text-sm sm:text-base">
                <span className="font-semibold text-gray-600 text-left">FAX</span>
                <span className="text-gray-600">:</span>
                <span className="ml-1 sm:ml-2">{activeOffice.fax}</span>
              </div>
              <div className="grid grid-cols-[80px_20px_auto] sm:grid-cols-[120px_20px_auto] items-center text-sm sm:text-base">
                <span className="font-semibold text-gray-600 text-left">HOMEPAGE</span>
                <span className="text-gray-600">:</span>
                <span className="ml-1 sm:ml-2 font-mono text-black">
                  <a 
                    href="https://www.run1080.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
                  >
                    {activeOffice.homepage}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* 지도 섹션 */}
          <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
            {activeTab === 'daejeon' && (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3213.2268925097114!2d127.44053799014415!3d36.35528272144064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3565485d389c9c51%3A0x51ff196e072e749b!2z64yA7KCE6rSR7Jet7IucIOuMgOuNleq1rCDruYTrnpjrj5kgMTAzLTEgMuy4tQ!5e0!3m2!1sko!2skr!4v1755626619658!5m2!1sko!2skr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="전마협 대전본사 위치"
              />
            )}
            {activeTab === 'yeongnam' && (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3211.0148260273727!2d128.1479576765432!3d36.408836589661774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3565b2a6ff09ceed%3A0x99d4e5179da5d1ec!2z6rK97IOB67aB64-EIOyDgeyjvOyLnCDrgpnslpHrj5kgMTQ2LTExMA!5e0!3m2!1sko!2skr!4v1755626666916!5m2!1sko!2skr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="전마협 영남지사 위치"
              />
            )}
            {activeTab === 'seoul' && (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.71747898088!2d127.07078482647353!3d37.51458103131422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca450879adccd%3A0x7701bd84f28c7f68!2z7J6g7Iuk7Jis66a87ZS97KO86rK96riw7J6l!5e0!3m2!1sko!2skr!4v1755626779717!5m2!1sko!2skr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="전마협 서울지사 위치"
              />
            )}
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}
