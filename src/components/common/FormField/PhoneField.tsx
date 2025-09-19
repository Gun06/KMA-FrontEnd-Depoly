// src/components/ui/FormField/PhoneField.tsx
import React from "react";
import TextField from "../TextField/TextField";
import Select from "../Select/Select";
import FormField from "./FormField";
import { FieldRow, Col } from "./FieldRow";
import Button from "../Button/Button";

const PREFIXES = ["010", "011", "016", "017", "018", "019"] as const;
type Prefix = (typeof PREFIXES)[number];

type Props = {
  label?: string;
  required?: boolean;

  // 액션/콜백
  onRequestAuth?: (phone: { prefix: string; mid: string; last: string }) => void;
  onChangePrefix?: (value: Prefix) => void;
  onChangeMid?: (value: string) => void;
  onChangeLast?: (value: string) => void;

  // 선택: 초기값
  defaultPrefix?: Prefix;
  defaultMid?: string;
  defaultLast?: string;
};

export function PhoneField({
  label = "연락처",
  required = true,
  onRequestAuth,
  onChangePrefix,
  onChangeMid,
  onChangeLast,
  defaultPrefix = "010",
  defaultMid = "",
  defaultLast = "",
}: Props) {
  const [prefix, setPrefix] = React.useState<Prefix>(defaultPrefix);
  const [mid, setMid] = React.useState(defaultMid);
  const [last, setLast] = React.useState(defaultLast);

  const triggerAuth = () => onRequestAuth?.({ prefix, mid, last });

  return (
    <FormField label={label} required={required}>
      {/* 3 / 3 / 3 / 3 */}
      <FieldRow className="items-center">
        <Col span={3}>
          <Select
            defaultValue={prefix}
            borderTone="strong"
            className="!text-[#33363D]"
            onChange={(e) => {
              const v = e.currentTarget.value as Prefix;
              setPrefix(v);
              onChangePrefix?.(v);
            }}
            aria-label="전화번호 앞자리 선택"
          >
            {PREFIXES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Col>

        <Col span={3}>
          <TextField
            placeholder="1234"
            inputMode="numeric"
            maxLength={4}
            className="h-14 text-[16px] leading-[24px]"
            value={mid}
            onChange={(e) => {
              const v = e.currentTarget.value.replace(/\D/g, "").slice(0, 4);
              setMid(v);
              onChangeMid?.(v);
            }}
            aria-label="전화번호 중간자리"
          />
        </Col>

        <Col span={3}>
          <TextField
            placeholder="5678"
            inputMode="numeric"
            maxLength={4}
            className="h-14 text-[16px] leading-[24px]"
            value={last}
            onChange={(e) => {
              const v = e.currentTarget.value.replace(/\D/g, "").slice(0, 4);
              setLast(v);
              onChangeLast?.(v);
            }}
            aria-label="전화번호 끝자리"
          />
        </Col>

        <Col span={3} className="flex justify-end">
          <Button widthType="phoneAuth" iconRight onClick={triggerAuth}>
            휴대폰 인증
          </Button>
        </Col>
      </FieldRow>
    </FormField>
  );
}
