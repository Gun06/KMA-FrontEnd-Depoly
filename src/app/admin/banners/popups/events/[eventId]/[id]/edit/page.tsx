import PopupEditForm from '@/components/admin/banners/popups/PopupEditForm';

type Props = { params: { eventId: string; id: string } };

export default function Page({ params }: Props) {
  const { eventId, id } = params;
  
  return (
    <div className="mx-auto max-w-[900px] px-4">
      <PopupEditForm id={id} eventId={eventId} />
    </div>
  );
}
