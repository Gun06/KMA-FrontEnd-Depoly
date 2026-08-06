/** 체크 시 상세주소 입력란에 넣는 고정 문구 (API에도 그대로 전달 가능) */
export const ADDRESS_DETAIL_NONE_LABEL = '상세주소 없음';

/** 구버전에서 상세주소 대신 마침표만 저장된 경우 불러올 때 정규화 */
export const ADDRESS_DETAIL_LEGACY_DOT = '.';

/** 조회·관리자 표시용 — API 빈값/레거시는 「상세주소 없음」으로 */
export function formatAddressDetailDisplay(detail: string | undefined | null): string {
  const t = (detail ?? '').trim();
  if (t === '' || t === ADDRESS_DETAIL_LEGACY_DOT || t === ADDRESS_DETAIL_NONE_LABEL) {
    return ADDRESS_DETAIL_NONE_LABEL;
  }
  return t;
}

/** 서버·세션에서 불러온 상세주소 → 폼 상태 */
export function mapLoadedAddressDetail(detail: string | undefined | null): {
  detailedAddress: string;
  noDetailedAddress: boolean;
} {
  const displayed = formatAddressDetailDisplay(detail);
  const noDetailedAddress = displayed === ADDRESS_DETAIL_NONE_LABEL;
  return {
    detailedAddress: displayed,
    noDetailedAddress
  };
}

type RegistrationAddressFormSlice = {
  address: string;
  postalCode: string;
  detailedAddress: string;
  noDetailedAddress: boolean;
};

/** addressDetail 필드는 항상 전송, 상세주소 없음/빈값은 빈 문자열 */
export function buildRegistrationAddressPayload(
  formData: RegistrationAddressFormSlice
): { address: string; zipCode: string; addressDetail: string } {
  const d = formData.detailedAddress.trim();
  return {
    address: formData.address,
    zipCode: formData.postalCode,
    addressDetail: formData.noDetailedAddress || !d ? '' : d
  };
}
