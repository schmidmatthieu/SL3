"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/events/event-list";
import { CreateEventDialog } from "@/components/events/create-event-dialog";
import { useAuth } from "@/lib/auth/auth-provider";
import { ProtectedRoute } from "@/lib/auth/protected-route";

export default function EventsPage() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <ProtectedRoute requiredPermissions={["manage:events"]}>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t("events.title")}</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("events.createNew")}
          </Button>
        </div>

        <EventList />

        <CreateEventDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </ProtectedRoute>
  );
}