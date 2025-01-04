'use client';

import { use } from 'react';

interface EventLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventLayout({ children, modal, params }: EventLayoutProps) {
  const { eventId } = use(params);

  if (!eventId || eventId === 'undefined') {
    console.error('EventLayout: Invalid eventId:', eventId);
  }

  return (
    <div className="relative" data-event-id={eventId}>
      {children}
      {modal}
    </div>
  );
}
