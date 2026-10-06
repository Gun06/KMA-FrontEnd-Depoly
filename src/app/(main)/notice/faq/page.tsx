'use client'

import React, { useState, useEffect } from 'react'
import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import { FaqPageFrame } from '@/components/common/faq/FaqPageFrame'
import { FaqList } from '@/components/common/faq/FaqList'
import { FaqLoadingState } from '@/components/common/faq/FaqLoadingState'
import { FaqErrorState } from '@/components/common/faq/FaqErrorState'
import { useFaqAccordion } from '@/components/common/faq/useFaqAccordion'
import type { DisplayFaqItem } from '@/components/common/faq/types'

interface ApiFaqItem {
  problem: string
  solution: string
}

interface FaqResponse {
  faqResponseList: ApiFaqItem[]
  empty: boolean
}

const FALLBACK_FAQ: DisplayFaqItem[] = [
  { question: '참가 등록은 어떻게 하나요?', answer: '홈 상단 메뉴의 접수안내 > 참가신청 가이드에서 절차를 확인한 뒤, 해당 대회 페이지에서 온라인으로 신청하실 수 있습니다.' },
  { question: '대회 코스는 어떻게 구성되어 있나요?', answer: '대회별 코스 안내 페이지에서 거리, 고도, 급수대 위치 등 세부 정보를 확인하실 수 있습니다.' },
  { question: '준비물은 무엇이 필요한가요?', answer: '신분증, 참가 확인증(또는 모바일 확인), 러닝화 및 개인 물품을 지참해 주세요. 대회별로 요구 사항이 다를 수 있으니 공지를 확인해 주세요.' },
  { question: '기록은 어떻게 확인하나요?', answer: '대회 종료 후 기록 조회 페이지에서 이름/생년월일 또는 배번호로 검색하실 수 있습니다. 인증서 발급도 가능합니다.' },
  { question: '자원봉사자로 어떻게 참여하나요?', answer: '공지사항 또는 자원봉사 신청 게시판에서 모집 공지를 확인하고 온라인 신청서를 제출해 주세요.' },
]

export default function FaqPage() {
  const [faqData, setFaqData] = useState<DisplayFaqItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOpen, toggle } = useFaqAccordion()

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
      } catch {
        setFaqData(FALLBACK_FAQ)
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFaqData()
  }, [])

  if (isLoading) {
    return (
      <SubmenuLayout
        wide
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "FAQ"
        }}
      >
        <FaqLoadingState />
      </SubmenuLayout>
    );
  }

  if (error) {
    return (
      <SubmenuLayout
        wide
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "FAQ"
        }}
      >
        <FaqErrorState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout
      wide
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "FAQ"
      }}
    >
      <FaqPageFrame>
        <FaqList
          faqItems={faqData}
          isOpen={isOpen}
          onToggle={toggle}
        />
      </FaqPageFrame>
    </SubmenuLayout>
  )
}
