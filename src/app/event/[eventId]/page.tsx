import { TopSection } from '@/components/event/TopSection';
import { MiddleSection } from '@/components/event/MiddleSection';
import { SnsSection } from '@/components/event/SnsSection';
import { BottomNoticeSection } from '@/components/event/BottomNoticeSection';
import NoticeSection from '@/components/event/NoticeSection';
import { FloatingApplyButton } from '@/components/event/FloatingButton';
import SponsorsMarquee from '@/components/event/Sponsors';
import topsectionBg from '@/assets/images/event/topsection.png';
import topsectionMobileBg from '@/assets/images/event/topsectionmobile.png';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = params;

  return (
    <div>
      {/* Notice 섹션 */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto">
          <NoticeSection 
            eventId={eventId}
            className="py-4"
            autoRotate={true}
            rotateInterval={4000}
          />
        </div>
      </div>
      
      {/* 청주 마라톤 2025 TopSection */}
      <TopSection 
        eventId={eventId} 
      />
      
      {/* Middle 섹션 */}
      <MiddleSection eventId={eventId} />
      
      {/* SNS 섹션 */}
      <SnsSection eventId={eventId} />
      
      {/* 공지사항 섹션 */}
      <BottomNoticeSection eventId={eventId} />
      
      {/* 플로팅 참가신청 버튼 */}
      <FloatingApplyButton eventId={eventId} />
    </div>
  );
}
