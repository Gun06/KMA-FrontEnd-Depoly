import PopupEditForm from '@/components/admin/banners/popups/PopupEditForm';

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 text-sm text-red-600">
        잘못된 ID입니다: <b>{params.id}</b>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4">
      <PopupEditForm id={id} />
    </div>
  );
}
