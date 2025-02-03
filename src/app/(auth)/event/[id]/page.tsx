import { Suspense } from 'react';
import EventDetailContainer from '@/features/routes/eventDetail/components/EventDetailContainer';
import { Metadata } from 'next';
import { Loading } from '@/components/ui/loading';

interface Props {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'イベント詳細 | AI Event Guide',
  description: 'イベントの詳細情報を表示します。',
};

export default async function EventPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <EventDetailContainer eventId={id} />
    </Suspense>
  );
}
