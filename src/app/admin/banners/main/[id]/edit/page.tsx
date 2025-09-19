import MainBannerEdit from '@/components/admin/banners/main/MainBannerEdit';

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  const id = Number(params.id || 0);
  return <MainBannerEdit idParam={isNaN(id) ? 0 : id} />;
}
