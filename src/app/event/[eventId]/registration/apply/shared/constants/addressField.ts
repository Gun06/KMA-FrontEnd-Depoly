/** 체크 시 상세주소 입력란에 넣는 고정 문구 (API에도 그대로 전달 가능) */
export const ADDRESS_DETAIL_NONE_LABEL = '상세주소 없음';

/** 구버전에서 상세주소 대신 마침표만 저장된 경우 불러올 때 정규화 */
export const ADDRESS_DETAIL_LEGACY_DOT = '.';

/** 서버·세션에서 불러온 상세주소 → 폼 상태 */
export function mapLoadedAddressDetail(detail: string | undefined | null): {
  detailedAddress: string;
  noDetailedAddress: boolean;
} {
  const t = (detail ?? '').trim();
  if (t === '' || t === ADDRESS_DETAIL_LEGACY_DOT) {
    return {
      detailedAddress: '',
      noDetailedAddress: true
    };
  }
  if (t === ADDRESS_DETAIL_NONE_LABEL) {
    return {
      detailedAddress: ADDRESS_DETAIL_NONE_LABEL,
      noDetailedAddress: true
    };
  }
  return { detailedAddress: t, noDetailedAddress: false };
}

type RegistrationAddressFormSlice = {
  address: string;
  postalCode: string;
  detailedAddress: string;
  noDetailedAddress: boolean;
};

/** noDetailedAddress면 `addressDetail` 생략, 아니면 값이 있을 때만 trim해서 전송 */
export function buildRegistrationAddressPayload(
  formData: RegistrationAddressFormSlice
): { address: string; zipCode: string; addressDetail?: string } {
  const d = formData.detailedAddress.trim();
  return {
    address: formData.address,
    zipCode: formData.postalCode,
    ...(formData.noDetailedAddress ? {} : (d ? { addressDetail: d } : {}))
  };
}
