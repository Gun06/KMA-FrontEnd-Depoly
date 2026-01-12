'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import Image from 'next/image'  
import downIcon from '@/assets/icons/main/down.svg'
import upIcon from '@/assets/icons/main/up.svg'
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

export default function FaqPage() {
  const [faqData, setFaqData] = useState<FaqItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

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
            setFaqData(mappedData)
          } else {
            setFaqData([])
          }
        } else {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        // 서버 에러 시 기본 데이터 사용
        setFaqData([
          { question: '참가 등록은 어떻게 하나요?', answer: '홈 상단 메뉴의 접수안내 > 참가신청 가이드에서 절차를 확인한 뒤, 해당 대회 페이지에서 온라인으로 신청하실 수 있습니다.' },
          { question: '대회 코스는 어떻게 구성되어 있나요?', answer: '대회별 코스 안내 페이지에서 거리, 고도, 급수대 위치 등 세부 정보를 확인하실 수 있습니다.' },
          { question: '준비물은 무엇이 필요한가요?', answer: '신분증, 참가 확인증(또는 모바일 확인), 러닝화 및 개인 물품을 지참해 주세요. 대회별로 요구 사항이 다를 수 있으니 공지를 확인해 주세요.' },
          { question: '기록은 어떻게 확인하나요?', answer: '대회 종료 후 기록 조회 페이지에서 이름/생년월일 또는 배번호로 검색하실 수 있습니다. 인증서 발급도 가능합니다.' },
          { question: '자원봉사자로 어떻게 참여하나요?', answer: '공지사항 또는 자원봉사 신청 게시판에서 모집 공지를 확인하고 온라인 신청서를 제출해 주세요.' },
        ])
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFaqData()
  }, [])

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      const isOpen = next.has(index)
      if (isOpen) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // FAQ 항목의 HTML을 미리 계산 (조건부 return 이전에 호출)
  const faqItemsWithHtml = useMemo(() => {
    return faqData.map(item => ({
      ...item,
      questionHtml: prepareHtmlForDisplay(item.question),
      answerHtml: prepareHtmlForDisplay(item.answer),
    }));
  }, [faqData]);

  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "FAQ"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-4 text-gray-600">FAQ를 불러오는 중...</span>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SubmenuLayout
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "FAQ"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "FAQ"
      }}
    >
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        <div className="bg-white rounded-lg shadow-sm">
          {/* FAQ 내용 */}
          <div className="px-6 md:px-8 py-6">
            {faqItemsWithHtml.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {faqItemsWithHtml.map((item, index) => {
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
                          dangerouslySetInnerHTML={{ __html: item.questionHtml }}
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
                          dangerouslySetInnerHTML={{ __html: item.answerHtml }}
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
      </div>
    </SubmenuLayout>
  )
}
