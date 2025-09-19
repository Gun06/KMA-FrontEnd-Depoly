// app/admin/banners/sponsors/[id]/edit/page.tsx
import SponsorEdit from '@/components/admin/banners/sponsors/SponsorEdit';

type PageProps = {
  params: { id: string };
};

export default function Page({ params }: PageProps) {
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return <div className="p-6">잘못된 경로입니다. (id: {params.id})</div>;
  }

  return <SponsorEdit idParam={id} />;
}
