'use client';

import { redirect } from 'next/navigation';
import { useRBAC } from '@/hooks/use-rbac-new';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useRBAC();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      redirect('/login');
    }
  }, [loading, role]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}