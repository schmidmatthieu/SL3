"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import type { Role } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermissions?: string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions,
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/sign-in");
      return;
    }

    if (user && requiredRole && user.role !== requiredRole) {
      router.push("/dashboard");
      return;
    }

    if (
      user &&
      requiredPermissions &&
      !requiredPermissions.every((permission) => hasPermission(permission))
    ) {
      router.push("/dashboard");
      return;
    }
  }, [user, isLoading, requiredRole, requiredPermissions, router, hasPermission]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) => hasPermission(permission))
  ) {
    return null;
  }

  return <>{children}</>;
}