'use client'

import { useEffect, useRef, useState } from 'react'
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import GuideHeader from '@/components/main/registration/GuideHeader'

export default function RegistrationGuidePage() {
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual')
  const [activeSection, setActiveSection] = useState('overview')
  const contentScrollRef = useRef<HTMLElement | null>(null)

  const guideContent = {
    individual: {
      badge: '개인 참가',
      title: '개인 참가신청 가이드',
      description:
        '처음 참가하시는 분도 쉽게 신청할 수 있도록, 대회 선택부터 신청 확정까지 핵심 절차를 순서대로 안내합니다.',
      steps: [
        {
          icon: '🔍',
          title: '대회 및 코스 선택',
          description: '참가 가능한 대회의 접수 일정, 참가 자격, 코스 정보를 확인합니다.'
        },
        {
          icon: '📝',
          title: '참가자 정보 입력',
          description: '이름, 생년월일, 연락처, 주소 등 필수 정보를 정확하게 입력합니다.'
        },
        {
          icon: '✅',
          title: '약관 동의 및 신청 완료',
          description: '유의사항과 환불 규정을 확인한 뒤 신청서를 제출합니다.'
        },
        {
          icon: '💳',
          title: '참가비 결제 확인',
          description: '입금 확인이 완료되면 신청 상태가 확정되며 마이페이지에서 확인할 수 있습니다.'
        }
      ],
      paymentInfo: [
        '참가비는 대회별 안내 계좌로 무통장 입금해 주세요.',
        '입금자명은 신청자명과 동일하게 입력해 주세요.',
        '입금 확인은 영업일 기준 1~2일 소요될 수 있습니다.',
        '입금 마감일까지 미입금 시 신청이 자동 취소될 수 있습니다.'
      ],
      refundInfo: [
        '환불 가능 기간은 대회별 공지사항 기준을 따릅니다.',
        '접수 마감 이후에는 운영 준비로 환불이 제한될 수 있습니다.',
        '환불 시 발생하는 수수료는 참가자 부담입니다.',
        '종목 변경 및 정보 수정은 마감 전 고객센터로 문의해 주세요.'
      ]
    },
    group: {
      badge: '단체 참가',
      title: '단체 참가신청 가이드',
      description:
        '팀 단위 신청에 필요한 대표자 등록, 참가자 일괄 입력, 결제 및 변경 요청 절차를 한 번에 확인하실 수 있습니다.',
      steps: [
        {
          icon: '👥',
          title: '단체 정보 등록',
          description: '단체명, 대표자, 연락 담당자 정보를 먼저 등록합니다.'
        },
        {
          icon: '📄',
          title: '참가자 명단 입력',
          description: '참가자별 인적사항을 직접 입력하거나 양식에 맞춰 일괄 등록합니다.'
        },
        {
          icon: '📌',
          title: '신청 내역 검토 및 제출',
          description: '코스, 인원, 금액을 확인한 뒤 단체 신청서를 최종 제출합니다.'
        },
        {
          icon: '🏦',
          title: '단체 결제 및 확정',
          description: '안내 계좌로 단체 참가비를 입금하면 확인 후 신청이 확정됩니다.'
        }
      ],
      paymentInfo: [
        '단체 참가비는 총액 기준으로 한 번에 입금해 주세요.',
        '입금자명은 단체명 또는 대표자명으로 통일해 주세요.',
        '입금 금액이 신청 금액과 다를 경우 확인이 지연될 수 있습니다.',
        '세금계산서·영수증 발급이 필요한 경우 사전에 고객센터로 문의해 주세요.'
      ],
      refundInfo: [
        '단체 환불/취소 기준은 대회별 공지사항을 우선 적용합니다.',
        '마감 이후 인원 감소, 코스 변경, 부분 환불은 제한될 수 있습니다.',
        '환불 승인 후 처리 기간은 영업일 기준으로 진행됩니다.',
        '참가자 교체 또는 명단 수정은 마감 전까지 요청해 주세요.'
      ]
    }
  } as const

  const tabContent = guideContent[activeTab]
  const sectionMenu = [
    { id: 'overview', label: '가이드 개요' },
    { id: 'steps', label: '신청 절차' },
    { id: 'payment', label: '결제 안내' },
    { id: 'refund', label: '환불/변경 안내' },
    { id: 'checklist', label: '신청 체크리스트' }
  ] as const

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (isDesktop && contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'auto' })
      setActiveSection('overview')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length === 0) return

        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const topEntry = visibleEntries[0]
        const sectionId = topEntry.target.getAttribute('id')
        if (sectionId) {
          setActiveSection(sectionId)
        }
      },
      {
        root: isDesktop ? contentScrollRef.current : null,
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0.2, 0.4, 0.7]
      }
    )

    sectionMenu.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [activeTab])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (isDesktop && contentScrollRef.current) {
      const containerTop = contentScrollRef.current.getBoundingClientRect().top
      const targetTop = element.getBoundingClientRect().top
      const nextTop = targetTop - containerTop + contentScrollRef.current.scrollTop - 8
      contentScrollRef.current.scrollTo({ top: nextTop, behavior: 'smooth' })
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setActiveSection(id)
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "접수안내",
        subMenu: "참가신청 가이드"
      }}
    >
      <GuideHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-[72vh]">
          <aside className="hidden lg:block self-start">
            <div className="h-full border border-gray-200 bg-[#f3f3f4] overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-200 bg-[#ececee]">
                <p className="text-xs font-medium text-gray-500">문서</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{tabContent.badge}</p>
              </div>
              <nav className="py-2">
                {sectionMenu.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      activeSection === section.id
                        ? 'bg-white text-gray-900 font-semibold'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <span>{section.label}</span>
                    <span className={`text-xs ${activeSection === section.id ? 'text-gray-700' : 'text-gray-400'}`}>⌄</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main
            ref={contentScrollRef}
            className="space-y-5 scroll-smooth px-4 pb-4 pt-0 lg:px-6 lg:pb-6 lg:pt-0 bg-white lg:h-full lg:overflow-y-auto"
          >
            <section id="overview" className="scroll-mt-24 border border-gray-200 bg-white">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-[#f4f4f7]">
                <h3 className="text-sm font-semibold text-gray-900">가이드 개요</h3>
              </div>
              <div className="p-4 lg:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{tabContent.badge}</p>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{tabContent.title}</h2>
                    <p className="text-xs lg:text-sm text-gray-600 mt-2 leading-relaxed">{tabContent.description}</p>
                  </div>
                  <div className="inline-flex rounded-md bg-[#f0f1f3] p-1 w-fit border border-gray-200">
                    <button
                      onClick={() => setActiveTab('individual')}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        activeTab === 'individual' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-600'
                      }`}
                    >
                      개인 신청
                    </button>
                    <button
                      onClick={() => setActiveTab('group')}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        activeTab === 'group' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-600'
                      }`}
                    >
                      단체 신청
                    </button>
                  </div>
                </div>
                <div className="mt-4 px-3 py-2 border border-[#d7d9ee] bg-[#f7f8ff] text-xs text-gray-700">
                  신청 정책은 대회별로 다를 수 있으므로, 각 대회 공지의 기준이 최종 우선 적용됩니다.
                </div>
              </div>
            </section>

            <section id="steps" className="scroll-mt-24 border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-[#f4f4f7] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">신청 절차</h3>
              </div>
              <div className="hidden lg:grid grid-cols-[88px_220px_minmax(0,1fr)] px-4 py-2 text-xs text-gray-500 border-b border-gray-200 bg-[#eef0f8]">
                <div>단계</div>
                <div>절차</div>
                <div>안내 내용</div>
              </div>
              <div>
                {tabContent.steps.map((step, index) => (
                  <div key={step.title} className="grid lg:grid-cols-[88px_220px_minmax(0,1fr)] gap-2 lg:gap-0 px-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs text-gray-500 font-medium">STEP {index + 1}</div>
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs lg:text-sm text-gray-600 leading-relaxed">{step.description}</div>
                  </div>
                ))}
              </div>
            </section>

            <section id="payment" className="scroll-mt-24 border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-[#f4f4f7] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">결제 안내</h3>
              </div>
              <div className="hidden lg:grid grid-cols-[88px_minmax(0,1fr)] px-4 py-2 text-xs text-gray-600 border-b border-blue-200 bg-blue-50">
                <div className="text-center">번호</div>
                <div className="text-center">내용</div>
              </div>
              <div>
                {tabContent.paymentInfo.map((info, index) => (
                  <div key={info} className="grid lg:grid-cols-[88px_minmax(0,1fr)] gap-2 lg:gap-0 px-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs text-gray-500 font-medium text-center">{index + 1}</div>
                    <p className="text-xs lg:text-sm text-gray-700">{info}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="refund" className="scroll-mt-24 border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 border-b border-rose-200 bg-rose-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-rose-800">환불/변경 안내</h3>
              </div>
              <div className="hidden lg:grid grid-cols-[88px_minmax(0,1fr)] px-4 py-2 text-xs text-rose-700 border-b border-rose-200 bg-rose-50/60">
                <div className="text-center">번호</div>
                <div className="text-center">내용</div>
              </div>
              <div>
                {tabContent.refundInfo.map((info, index) => (
                  <div key={info} className="grid lg:grid-cols-[88px_minmax(0,1fr)] gap-2 lg:gap-0 px-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs text-gray-500 font-medium text-center">{index + 1}</div>
                    <p className="text-xs lg:text-sm text-gray-700">{info}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="checklist" className="scroll-mt-24 border border-gray-200 bg-white overflow-hidden mb-6 lg:mb-8">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-[#f4f4f7] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">신청 전 체크리스트</h3>
              </div>
              <div className="p-4 lg:p-5 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 mt-0.5">1.</span>
                  <p className="text-xs lg:text-sm text-gray-700">신청 마감일, 참가비, 환불 기준은 대회별 공지를 꼭 확인해 주세요.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 mt-0.5">2.</span>
                  <p className="text-xs lg:text-sm text-gray-700">참가자 정보 오기재 시 참가 확인 및 기록 조회에 문제가 생길 수 있습니다.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 mt-0.5">3.</span>
                  <p className="text-xs lg:text-sm text-gray-700">신청 후 마이페이지에서 처리 상태와 공지사항을 수시로 확인해 주세요.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <div className="lg:hidden mb-6">
        <div className="rounded-md border border-gray-200 bg-white p-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {sectionMenu.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}
