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

/** 접수 폼과 동일: 도로명+참고항목(법정동·건물명)을 기본주소에 합침 */
function buildFullAddress(data: {
  userSelectedType?: string
  roadAddress?: string
  jibunAddress?: string
  address?: string
  bname?: string
  buildingName?: string
  apartment?: string
}): string {
  let fullAddress =
    data.userSelectedType === 'R'
      ? data.roadAddress || data.address || ''
      : data.userSelectedType === 'J'
        ? data.jibunAddress || data.address || ''
        : data.address || ''

  if (data.userSelectedType === 'R') {
    let extraAddress = ''
    if (data.bname && /[동|로|가]$/g.test(data.bname)) {
      extraAddress += data.bname
    }
    if (data.buildingName) {
      extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
    }
    if (extraAddress) {
      fullAddress += ` (${extraAddress})`
    }
  }

  return fullAddress
}

export default function PostalCodeSearch({ onComplete, onClose }: PostalCodeSearchProps) {
  const isOpeningRef = useRef(false)

  const openPostalCodeSearch = useCallback(() => {
    if (isOpeningRef.current) return
    if (typeof window.daum === 'undefined') return

    isOpeningRef.current = true

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        isOpeningRef.current = false
        onComplete({
          postalCode: data.zonecode,
          address: buildFullAddress(data),
          // 상세주소(동·호수)는 사용자가 직접 입력
          detailedAddress: '',
        })
        onClose()
        window.setTimeout(() => {
          window.focus()
        }, 0)
      },
      onclose: function () {
        isOpeningRef.current = false
        onClose()
        window.setTimeout(() => {
          window.focus()
        }, 0)
      },
    }).open()
  }, [onComplete, onClose])

  useEffect(() => {
    const existingScript = document.getElementById(POSTCODE_SCRIPT_ID)

    if (existingScript) {
      if (window.daum) {
        openPostalCodeSearch()
      } else {
        existingScript.addEventListener('load', openPostalCodeSearch, { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.id = POSTCODE_SCRIPT_ID
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => {
      openPostalCodeSearch()
    }
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(POSTCODE_SCRIPT_ID)
      if (scriptToRemove && scriptToRemove === script) {
        scriptToRemove.removeEventListener('load', openPostalCodeSearch)
      }
      isOpeningRef.current = false
    }
  }, [openPostalCodeSearch])

  return null
}
