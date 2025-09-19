// src/components/ui/FormField/AddressField.tsx
import React from "react";
import TextField from "../TextField/TextField";
import Button from "../Button/Button";
import FormField from "./FormField";
import { FieldRow, Col } from "./FieldRow";

type Props = {
  label?: string;
  required?: boolean;

  // 콜백들
  onSearchZip?: () => void;
  onChangePostcode?: (value: string) => void;
  onChangeAddress?: (value: string) => void;
  onChangeAddressDetail?: (value: string) => void;

  // 선택: 초기값
  defaultPostcode?: string;
  defaultAddress?: string;
  defaultAddressDetail?: string;
};

export function AddressField({
  label = "주소",
  required = true,
  onSearchZip,
  onChangePostcode,
  onChangeAddress,
  onChangeAddressDetail,
  defaultPostcode = "",
  defaultAddress = "",
  defaultAddressDetail = "",
}: Props) {
  const [postcode, setPostcode] = React.useState(defaultPostcode);
  const [addr1, setAddr1] = React.useState(defaultAddress);
  const [addr2, setAddr2] = React.useState(defaultAddressDetail);

  return (
    <FormField label={label} required={required}>
      <FieldRow className="items-center gap-4">
        <Col span={4}>
          <TextField
            placeholder="우편번호"
            value={postcode}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setPostcode(v);
              onChangePostcode?.(v);
            }}
          />
        </Col>
        <Col span={3}>
          <Button
            tone="primary"
            size="md"
            widthType="zipcode"
            iconRight
            onClick={onSearchZip}
            aria-label="우편번호 검색"
          >
            우편번호 찾기
          </Button>
        </Col>
      </FieldRow>

      <div className="grid grid-cols-12 gap-4">
        <div className="mt-3 col-span-12">
          <TextField
            placeholder="주소를 입력해주세요."
            value={addr1}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setAddr1(v);
              onChangeAddress?.(v);
            }}
          />
        </div>
        <div className="col-span-12">
          <TextField
            placeholder="상세주소를 입력해주세요."
            value={addr2}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setAddr2(v);
              onChangeAddressDetail?.(v);
            }}
          />
        </div>
      </div>
    </FormField>
  );
}
