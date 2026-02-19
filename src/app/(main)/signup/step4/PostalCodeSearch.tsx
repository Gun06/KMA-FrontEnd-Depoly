"use client"

import React, { useEffect, useCallback, useRef } from 'react'

interface PostalCodeSearchProps {
  onComplete: (data: { postalCode: string; address: string; detailedAddress: string }) => void
  onClose: () => void
}

declare global {
  interface Window {
    daum?: any
  }
}

const POSTCODE_SCRIPT_ID = 'daum-postcode-script'

export default function PostalCodeSearch({ onComplete, onClose }: PostalCodeSearchProps) {
  const isOpeningRef = useRef(false)

  const openPostalCodeSearch = useCallback(() => {
    if (isOpeningRef.current) return // 이미 열리는 중이면 무시
    if (typeof window.daum === 'undefined') return

    isOpeningRef.current = true

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        isOpeningRef.current = false
        // 우편번호 정보를 해당 필드에 넣는다.
        onComplete({
          postalCode: data.zonecode,
          address: data.address,
          detailedAddress: data.bname + ' ' + data.buildingName
        })
        onClose()
      },
      onclose: function() {
        isOpeningRef.current = false
        onClose()
      }
    }).open()
  }, [onComplete, onClose])

  useEffect(() => {
    // 스크립트가 이미 로드되어 있는지 확인
    const existingScript = document.getElementById(POSTCODE_SCRIPT_ID)
    
    if (existingScript) {
      // 스크립트가 이미 있으면 바로 열기
      if (window.daum) {
        openPostalCodeSearch()
      } else {
        // 스크립트는 있지만 아직 로드 중이면 onload 이벤트 대기
        existingScript.addEventListener('load', openPostalCodeSearch, { once: true })
      }
      return
    }

    // 다음 우편번호 스크립트 로드
    const script = document.createElement('script')
    script.id = POSTCODE_SCRIPT_ID
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => {
      openPostalCodeSearch()
    }
    document.head.appendChild(script)

    return () => {
      // cleanup: 스크립트가 존재하고 우리가 추가한 것인지 확인
      const scriptToRemove = document.getElementById(POSTCODE_SCRIPT_ID)
      if (scriptToRemove && scriptToRemove === script) {
        // 다른 컴포넌트에서 사용 중일 수 있으므로 제거하지 않음
        // 대신 이벤트 리스너만 제거
        scriptToRemove.removeEventListener('load', openPostalCodeSearch)
      }
      isOpeningRef.current = false
    }
  }, [openPostalCodeSearch])

  return null
}
