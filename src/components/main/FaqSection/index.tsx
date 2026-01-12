'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'  
import downIcon from '@/assets/icons/main/down.svg'
import upIcon from '@/assets/icons/main/up.svg'
import SectionPanel from '@/components/main/SectionPanel'
import { prepareHtmlForDisplay } from '@/components/common/TextEditor/utils/prepareHtmlForDisplay'

interface FaqItem {
  question: string
  answer: string
}

// API 응답 타입 정의
interface ApiFaqItem {
  problem: string
  solution: string
}

interface FaqResponse {
  faqResponseList: ApiFaqItem[]
  empty: boolean
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
  const [apiFaqData, setApiFaqData] = useState<FaqItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API 데이터 가져오기
  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER
        if (!API_BASE_URL) {
          throw new Error('API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.')
        }
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/FAQ`
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        if (response.ok) {
          const data: FaqResponse = await response.json()
          if (data.faqResponseList && data.faqResponseList.length > 0) {
            const mappedData = data.faqResponseList.map(item => ({
              question: item.problem,
              answer: item.solution
            }))
            setApiFaqData(mappedData)
          } else {
            setApiFaqData([])
          }
        } else {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        // 서버 에러 시 기본 데이터 사용
        setApiFaqData([])
        setError(null) // 에러 상태를 null로 설정하여 기본 데이터 표시
      } finally {
        setIsLoading(false)
      }
    }
    fetchFaqData()
  }, [])

  // 표시할 데이터 결정 (API 데이터가 있으면 사용, 없으면 기본 데이터)
  const faqItems = useMemo(() => {
    if (apiFaqData.length > 0) {
      return apiFaqData
    }
    return items ?? DefaultItems()
  }, [apiFaqData, items])

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
        showChevron={false}
        backgroundLayer={undefined}
        titleClassName="">
        {/* 빈 children으로 에러 방지 */}
      </SectionPanel>
      
      {/* FAQ 내용을 SectionPanel 아래에 별도 배치 */}
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6">
        <div className="px-6 md:px-20">
          {isLoading ? (
            // 스켈레톤 UI
            <div className="divide-y divide-gray-200 bg-white rounded-md">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="py-6">
                  <div className="w-full flex items-center gap-4">
                    {/* Q 마크 스켈레톤 */}
                    <div className="w-6 md:w-7 h-6 md:h-7 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                    {/* 질문 텍스트 스켈레톤 */}
                    <div className="flex-1 space-y-2">
                      <div className="h-5 md:h-6 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 md:h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    {/* 화살표 아이콘 스켈레톤 */}
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : faqItems.length > 0 ? (
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
                      <span 
                        className="flex-1 font-pretendard text-[16px] md:text-[18px] text-gray-900 [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:min-h-[1.5em] [&_p]:leading-[1.6]"
                        dangerouslySetInnerHTML={{ __html: useMemo(() => prepareHtmlForDisplay(item.question), [item.question]) }}
                      />
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
                      <div 
                        className="mt-2 rounded-md bg-gray-100 p-4 md:p-6 min-h-[120px] md:min-h-[160px] text-gray-700 text-[14px] md:text-[16px] [&_p]:m-0 [&_p]:whitespace-pre-wrap [&_p]:min-h-[1.5em] [&_p]:leading-[1.6]"
                        dangerouslySetInnerHTML={{ __html: useMemo(() => prepareHtmlForDisplay(item.answer), [item.answer]) }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">FAQ가 없습니다.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

