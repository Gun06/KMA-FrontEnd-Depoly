// src/components/ui/FormField/IdCheckField.tsx
import React from "react";
import Button from "../Button/Button";
import FormField from "./FormField";
import { FieldRow, Col } from "./FieldRow";
import TextField from "../TextField/TextField";

type Props = {
  label?: string;                     // 기본: "아이디"
  placeholder?: string;               // 기본: "영문/숫자 조합으로 4자~15자 이내"
  buttonText?: string;                // 기본: "중복검사"

  // 콜백
  onCheck?: (value: string) => void;  // 버튼 클릭 시
  onChange?: (value: string) => void; // 입력 변경 시

  // 선택: 초기값
  defaultValue?: string;
};

export default function IdCheckField({
  label = "아이디",
  placeholder = "영문/숫자 조합으로 4자~15자 이내",
  buttonText = "중복검사",
  onCheck,
  onChange,
  defaultValue = "",
}: Props) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <FormField label={label} required>
      <FieldRow>
        <Col span={7}>
          <TextField
            value={value}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setValue(v);
              onChange?.(v);
            }}
            placeholder={placeholder}
            aria-label="아이디 입력"
          />
        </Col>
        <Col span={3} className="flex justify-end">
          <Button
            widthType="idCheck"
            iconRight
            onClick={() => onCheck?.(value)}
            aria-label={`${buttonText} 실행`}
          >
            {buttonText}
          </Button>
        </Col>
      </FieldRow>
    </FormField>
  );
}
