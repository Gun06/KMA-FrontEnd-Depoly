// src/components/common/Badge/PaymentBadgeApplicants.tsx
import Badge from "./Badge";

type Props = {
  paid?: boolean; // 기존 호환
  payStatus?: '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료';
};

export default function PaymentBadge({ paid, payStatus }: Props) {
  const status = payStatus ?? (paid ? '결제완료' : '미결제');
  
  // 6개 상태에 맞는 색상 매핑
  const getTone = (status: string) => {
    switch (status) {
      case '결제완료': return 'success';     // 초록색 - 정상 완료
      case '미결제': return 'danger';        // 빨간색 - 주의 필요
      case '확인필요': return 'primary';     // 파란색 - 관리자 확인 필요
      case '차액환불요청': return 'warning'; // 주황색 - 부분 환불 처리 필요 (경고)
      case '전액환불요청': return 'warning'; // 주황색 - 환불 처리 필요 (경고)
      case '전액환불완료': return 'neutral'; // 회색 - 환불 완료
      default: return 'neutral';
    }
  };

  return (
    <Badge variant="soft" tone={getTone(status)} size="applicationPill" className="justify-center">
      {status}
    </Badge>
  );
}
