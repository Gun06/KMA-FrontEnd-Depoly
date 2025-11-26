import PopupEditForm from '@/components/admin/banners/popups/PopupEditForm';

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  const id = params.id;
  
  return (
    <div className="mx-auto max-w-[900px] px-4">
      <PopupEditForm id={id} />
    </div>
  );
}
