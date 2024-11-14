"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">
        {t("dashboard.welcome", { name: user?.name })}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasPermission("manage:events") && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("dashboard.manageEvents")}
            </h2>
            {/* Event management UI */}
          </Card>
        )}

        {hasPermission("manage:rooms") && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("dashboard.manageRooms")}
            </h2>
            {/* Room management UI */}
          </Card>
        )}

        {hasPermission("stream:manage") && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("dashboard.manageStreams")}
            </h2>
            {/* Streaming management UI */}
          </Card>
        )}
      </div>
    </div>
  );
}