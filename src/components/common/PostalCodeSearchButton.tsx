"use client";

import { useEffect } from 'react';

type PostalCodeSearchButtonProps = {
  onSelect: (postalCode: string, address: string) => void;
  className?: string;
  label?: string;
};

declare global {
  interface Window {
    daum?: any;
  }
}

const POSTCODE_SCRIPT_ID = 'daum-postcode-script';

export default function PostalCodeSearchButton({
  onSelect,
  className,
  label = '주소 검색',
}: PostalCodeSearchButtonProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById(POSTCODE_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = POSTCODE_SCRIPT_ID;
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const openPostcode = () => {
    if (typeof window === 'undefined' || !window.daum || !window.daum.Postcode) {
      alert('주소 검색 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete(data: any) {
        let fullAddress = data.address;
        if (data.userSelectedType === 'R') {
          fullAddress = data.roadAddress;
          let extraAddress = '';
          if (data.bname && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          if (data.buildingName) {
            extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
          }
          if (extraAddress) {
            fullAddress += ` (${extraAddress})`;
          }
        } else if (data.jibunAddress) {
          fullAddress = data.jibunAddress;
        }

        onSelect(data.zonecode, fullAddress);
      },
    }).open();
  };

  return (
    <button
      type="button"
      onClick={openPostcode}
      className={`px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 ${className ?? ''}`}
    >
      {label}
    </button>
  );
}


