import { Metadata } from 'next';

import { AdminDashboard } from '@/components/pages/global-admin/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SL3',
  description: 'System administration and monitoring dashboard',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
