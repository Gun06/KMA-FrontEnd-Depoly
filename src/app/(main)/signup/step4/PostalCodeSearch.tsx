"use client"

import React, { useEffect } from 'react'

interface PostalCodeSearchProps {
  onComplete: (data: { postalCode: string; address: string; detailedAddress: string }) => void
  onClose: () => void
}

declare global {
  interface Window {
    daum?: any
  }
}

export default function PostalCodeSearch({ onComplete, onClose }: PostalCodeSearchProps) {
  useEffect(() => {
    // 다음 우편번호 스크립트 로드
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => {
      openPostalCodeSearch()
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const openPostalCodeSearch = () => {
    if (typeof window.daum === 'undefined') return

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 우편번호 정보를 해당 필드에 넣는다.
        onComplete({
          postalCode: data.zonecode,
          address: data.address,
          detailedAddress: data.bname + ' ' + data.buildingName
        })
        onClose()
      },
      onclose: function() {
        onClose()
      }
    }).open()
  }

  return null
}
