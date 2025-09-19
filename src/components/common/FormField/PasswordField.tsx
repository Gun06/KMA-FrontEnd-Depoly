// src/components/ui/FormField/PasswordField.tsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "../TextField/TextField";
import FormField from "./FormField";

type PasswordFieldProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  borderTone?: "strong" | "light";
};

export default function PasswordField({
  label = "비밀번호",
  placeholder = "비밀번호를 입력해주세요.",
  required = true,
  borderTone = "strong",
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <FormField label={label} required={required}>
      <div className="relative">
        <TextField
          type={show ? "text" : "password"}
          placeholder={placeholder}
          borderTone={borderTone}
          className="pr-12"            // 아이콘 공간
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center"
          aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          {show ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
        </button>
      </div>
    </FormField>
  );
}
