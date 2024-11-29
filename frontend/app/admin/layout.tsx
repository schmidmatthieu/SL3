import { redirect } from 'next/navigation';

// This is a placeholder for actual auth check
const isAuthenticated = () => {
  // Implement your authentication logic here
  return true;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated()) {
    redirect('/login');
  }

  return <>{children}</>;
}