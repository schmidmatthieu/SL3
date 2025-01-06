'use client';

import { AuthForm } from '@/components/features/users/auth/auth-form';

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <AuthForm />
    </div>
  );
}
