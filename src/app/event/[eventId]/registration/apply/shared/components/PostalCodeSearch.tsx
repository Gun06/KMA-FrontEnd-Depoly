"use client";

import { useEffect } from 'react';

interface PostalCodeSearchProps {
  onAddressSelect: (postalCode: string, address: string) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

export default function PostalCodeSearch({ onAddressSelect }: PostalCodeSearchProps) {
  useEffect(() => {
    // 다음 우편번호 스크립트 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePostalCodeSearch = () => {
    if (!window.daum) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 팝업에서 검색결과를 선택했을 때 실행할 코드
        let fullAddress = data.address; // 주소 변수
        let extraAddress = ''; // 참고항목 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
          fullAddress = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
          fullAddress = data.jibunAddress;
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if (data.userSelectedType === 'R') {
          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          } else if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if (extraAddress !== '') {
            extraAddress = ' (' + extraAddress + ')';
          }
          // 조합된 참고항목을 해당 필드에 넣는다.
          fullAddress += extraAddress;
        }

        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        onAddressSelect(data.zonecode, fullAddress);
      }
    }).open();
  };

  return (
    <button
      type="button"
      onClick={handlePostalCodeSearch}
      className="px-4 py-3 sm:py-3 bg-blue-600 text-sm sm:text-base text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center justify-center"
    >
      우편번호 찾기 →
    </button>
  );
}
