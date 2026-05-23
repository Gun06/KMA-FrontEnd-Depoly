// src/components/common/Badge/PaymentBadgeApplicants.tsx
import Badge from "./Badge";
import { cn } from "@/utils/cn";

type PayStatus = '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료';

type Props = {
  paid?: boolean; // 기존 호환
  payStatus?: PayStatus;
  /** pill: 둥근 배지(테이블 등), tag: 사각 태그(상세 드로어 등) */
  appearance?: 'pill' | 'tag';
};

const TAG_STATUS_CLASS: Record<PayStatus, string> = {
  '결제완료': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  '미결제': 'border-rose-200 bg-rose-50 text-rose-700',
  '확인필요': 'border-blue-200 bg-blue-50 text-blue-700',
  '차액환불요청': 'border-orange-200 bg-orange-50 text-orange-700',
  '전액환불요청': 'border-orange-200 bg-orange-50 text-orange-700',
  '전액환불완료': 'border-gray-200 bg-gray-50 text-gray-700',
};

export default function PaymentBadge({ paid, payStatus, appearance = 'pill' }: Props) {
  const status: PayStatus = payStatus ?? (paid ? '결제완료' : '미결제');

  if (appearance === 'tag') {
    return (
      <span
        className={cn(
          'inline-block shrink-0 px-2.5 py-1 rounded border text-xs font-medium whitespace-nowrap',
          TAG_STATUS_CLASS[status] ?? TAG_STATUS_CLASS['전액환불완료']
        )}
      >
        {status}
      </span>
    );
  }

  const getTone = (s: PayStatus) => {
    switch (s) {
      case '결제완료': return 'success';
      case '미결제': return 'danger';
      case '확인필요': return 'primary';
      case '차액환불요청': return 'warning';
      case '전액환불요청': return 'warning';
      case '전액환불완료': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <Badge variant="soft" tone={getTone(status)} size="applicationPill" className="justify-center">
      {status}
    </Badge>
  );
}
