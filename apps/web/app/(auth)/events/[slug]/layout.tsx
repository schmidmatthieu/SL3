'use client';

import { use } from 'react';

interface EventLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default function EventLayout({ children, modal, params }: EventLayoutProps) {
  const { slug } = use(params);

  if (!slug || slug === 'undefined') {
    console.error('EventLayout: Invalid slug:', slug);
  }

  return (
    <div className="relative" data-event-slug={slug}>
      {children}
      {modal}
    </div>
  );
}
