import TextField from "../TextField/TextField";
import Select from "../Select/Select";
import FormField from "./FormField";
import { FieldRow, Col } from "./FieldRow";

export function EmailField() {
  return (
    <FormField label="이메일" required>
      <FieldRow>
        <Col span={4}><TextField placeholder="아이디" /></Col>
        <Col span={1} className="flex items-center justify-center">@</Col>
        <Col span={4}><TextField placeholder="도메인" /></Col>
        <Col span={3}>
            <Select placeholder="- 직접입력 -" defaultValue="" borderTone="strong">
            {["gmail.com","naver.com","daum.net","hanmail.com"].map(d => (
                <option key={d} value={d}>{d}</option>
            ))}
            </Select>
        </Col>
      </FieldRow>
    </FormField>
  );
}
