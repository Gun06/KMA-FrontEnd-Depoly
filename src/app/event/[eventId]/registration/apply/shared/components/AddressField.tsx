// 주소 입력 필드 컴포넌트
import React from 'react';
import PostalCodeSearch from './PostalCodeSearch';
import { ADDRESS_DETAIL_NONE_LABEL } from '../constants/addressField';

interface AddressFieldProps {
  postalCode: string;
  address: string;
  detailedAddress: string;
  noDetailedAddress: boolean;
  onPostalCodeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onDetailedAddressChange: (value: string) => void;
  onNoDetailedAddressChange: (checked: boolean) => void;
  onAddressSelect: (postalCode: string, address: string) => void;
  disabled?: boolean;
}

export default function AddressField({
  postalCode,
  address,
  detailedAddress,
  noDetailedAddress,
  onPostalCodeChange,
  onAddressChange,
  onDetailedAddressChange,
  onNoDetailedAddressChange,
  onAddressSelect,
  disabled = false
}: AddressFieldProps) {
  const detailDisabled = disabled || noDetailedAddress;

  const handleNoDetailCheck = (checked: boolean) => {
    if (checked) {
      onNoDetailedAddressChange(true);
      onDetailedAddressChange(ADDRESS_DETAIL_NONE_LABEL);
    } else {
      onNoDetailedAddressChange(false);
      if (detailedAddress.trim() === ADDRESS_DETAIL_NONE_LABEL) {
        onDetailedAddressChange('');
      }
    }
  };

  return (
    <div className="flex-1 space-y-2">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <input
          type="text"
          placeholder="우편번호"
          value={postalCode}
          onChange={(e) => onPostalCodeChange(e.target.value)}
          disabled={disabled}
          className={`w-full sm:w-32 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          readOnly
        />
        <PostalCodeSearch onAddressSelect={disabled ? () => {} : onAddressSelect} disabled={disabled} />
      </div>
      <input
        type="text"
        placeholder="기본주소"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        readOnly
      />
      <input
        type="text"
        placeholder="동·호수·건물명 등"
        value={detailedAddress}
        onChange={(e) => onDetailedAddressChange(e.target.value)}
        disabled={detailDisabled}
        className={`w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
          detailDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
      <label className="flex items-start gap-2 cursor-pointer select-none text-sm text-gray-700">
        <input
          type="checkbox"
          checked={noDetailedAddress}
          onChange={(e) => handleNoDetailCheck(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          상세주소가 없습니다 <span className="text-gray-500">(단독주택·번지만 있는 주소 등)</span>
        </span>
      </label>
    </div>
  );
}
