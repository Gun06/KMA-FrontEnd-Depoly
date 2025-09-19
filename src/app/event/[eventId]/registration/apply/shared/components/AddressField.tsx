// 주소 입력 필드 컴포넌트
import React from 'react';
import PostalCodeSearch from './PostalCodeSearch';

interface AddressFieldProps {
  postalCode: string;
  address: string;
  detailedAddress: string;
  onPostalCodeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onDetailedAddressChange: (value: string) => void;
  onAddressSelect: (postalCode: string, address: string) => void;
}

export default function AddressField({
  postalCode,
  address,
  detailedAddress,
  onPostalCodeChange,
  onAddressChange,
  onDetailedAddressChange,
  onAddressSelect
}: AddressFieldProps) {
  return (
    <div className="flex-1 space-y-2">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <input
          type="text"
          placeholder="우편번호"
          value={postalCode}
          onChange={(e) => onPostalCodeChange(e.target.value)}
          className="w-full sm:w-32 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          readOnly
        />
        <PostalCodeSearch onAddressSelect={onAddressSelect} />
      </div>
      <input
        type="text"
        placeholder="기본주소"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        readOnly
      />
      <input
        type="text"
        placeholder="상세주소 (선택사항)"
        value={detailedAddress}
        onChange={(e) => onDetailedAddressChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
      />
    </div>
  );
}
