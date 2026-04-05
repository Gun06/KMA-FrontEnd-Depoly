import { Suspense } from 'react';
import Client from './Client';

export default function LocalEventPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-white" />}>
      <Client />
    </Suspense>
  );
}
