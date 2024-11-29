import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SL3',
  description: 'System administration and monitoring dashboard',
};

export default function AdminPage() {
  return <AdminDashboard />;
}