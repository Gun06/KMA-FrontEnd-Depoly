import { notFound } from 'next/navigation';
import AdminLikeDetailClient from '@/app/admin/local-events/[eventId]/Client';
import LocalEventBanner from '../components/LocalEventBanner';

export const dynamicParams = true;

export default function Page({ params }: { params: { eventId: string } }) {
  const id = params.eventId;
  if (!id || id.trim() === '') notFound();
  return (
    <div className="min-h-screen bg-white">
      <LocalEventBanner />
      <AdminLikeDetailClient eventId={id} mode="user" />
    </div>
  );
}

