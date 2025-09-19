'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'  
import downIcon from '@/assets/icons/main/down.svg'
import upIcon from '@/assets/icons/main/up.svg'
import SectionPanel from '@/components/main/SectionPanel'

interface FaqItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  /** 외부에서 FAQ 항목을 주입할 수 있도록 허용 */
  items?: FaqItem[]
  /** 여러 개 동시 펼침 허용 여부 */
  allowMultipleOpen?: boolean
}

function DefaultItems(): FaqItem[] {
  return [
    { question: '참가 등록은 어떻게 하나요?', answer: '홈 상단 메뉴의 접수안내 > 참가신청 가이드에서 절차를 확인한 뒤, 해당 대회 페이지에서 온라인으로 신청하실 수 있습니다.' },
    { question: '대회 코스는 어떻게 구성되어 있나요?', answer: '대회별 코스 안내 페이지에서 거리, 고도, 급수대 위치 등 세부 정보를 확인하실 수 있습니다.' },
    { question: '준비물은 무엇이 필요한가요?', answer: '신분증, 참가 확인증(또는 모바일 확인), 러닝화 및 개인 물품을 지참해 주세요. 대회별로 요구 사항이 다를 수 있으니 공지를 확인해 주세요.' },
    { question: '기록은 어떻게 확인하나요?', answer: '대회 종료 후 기록 조회 페이지에서 이름/생년월일 또는 배번호로 검색하실 수 있습니다. 인증서 발급도 가능합니다.' },
    { question: '자원봉사자로 어떻게 참여하나요?', answer: '공지사항 또는 자원봉사 신청 게시판에서 모집 공지를 확인하고 온라인 신청서를 제출해 주세요.' },
  ]
}

export default function FaqSection({
  items,
  allowMultipleOpen = false,
}: FaqSectionProps) {
  const faqItems = useMemo(() => items ?? DefaultItems(), [items])

  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      const isOpen = next.has(index)
      if (allowMultipleOpen) {
        if (isOpen) next.delete(index)
        else next.add(index)
      } else {
        next.clear()
        if (!isOpen) next.add(index)
      }
      return next
    })
  }

  return (
    <section aria-labelledby="faq-title" className="bg-white">
      <SectionPanel
        title="자주 묻는 질문 FAQ"
        fullBleed
        backgroundLayer={undefined}
        titleClassName="">
        {/* 빈 children으로 에러 방지 */}
      </SectionPanel>
      
      {/* FAQ 내용을 SectionPanel 아래에 별도 배치 */}
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6">
        <div className="px-6 md:px-20">
          <div className="divide-y divide-gray-200 bg-white rounded-md">
            {faqItems.map((item, index) => {
              const isOpen = openSet.has(index)
              const buttonId = `faq-button-${index}`
              const panelId = `faq-panel-${index}`
              return (
                <div key={index} className="">
                  <button
                    id={buttonId}
                    aria-controls={panelId}
                    aria-expanded={isOpen}
                    onClick={() => toggle(index)}
                    className="w-full flex items-center gap-4 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 pl-0 pr-0"
                  >
                    <span aria-hidden className="text-gray-800 font-giants text-[22px] md:text-[28px] leading-none">
                      Q
                    </span>
                    <span className="flex-1 font-pretendard text-[16px] md:text-[18px] text-gray-900">
                      {item.question}
                    </span>
                    <span aria-hidden>
                      <Image
                        src={isOpen ? upIcon : downIcon}
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4 md:w-5 md:h-5"
                      />
                    </span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className="pb-6 pl-10 pr-0"
                  >
                    <div className="mt-2 rounded-md bg-gray-100 p-4 md:p-6 min-h-[120px] md:min-h-[160px] text-gray-700 text-[14px] md:text-[16px] whitespace-pre-line">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

