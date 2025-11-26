// src/components/common/Badge/PaymentBadge.tsx
import Badge from "./Badge";

type Props = {
  paid?: boolean; // 기존 호환
  payStatus?: '입금' | '미입금' | '확인요망';
};

export default function PaymentBadge({ paid, payStatus }: Props) {
  const status = payStatus ?? (paid ? '입금' : '미입금');
  const tone =
    status === '입금' ? 'success' :
    status === '미입금' ? 'danger' : 'primary';

  return (
    <Badge variant="soft" tone={tone} size="pill" className="justify-center">
      {status}
    </Badge>
  );
}