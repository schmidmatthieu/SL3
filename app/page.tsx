"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Users, Video, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("common.welcome")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("common.tagline")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={<Monitor className="h-8 w-8" />}
          title={t("features.multipleRooms.title")}
          description={t("features.multipleRooms.description")}
        />
        <FeatureCard
          icon={<Video className="h-8 w-8" />}
          title={t("features.streaming.title")}
          description={t("features.streaming.description")}
        />
        <FeatureCard
          icon={<MessageSquare className="h-8 w-8" />}
          title={t("features.interactive.title")}
          description={t("features.interactive.description")}
        />
        <FeatureCard
          icon={<Users className="h-8 w-8" />}
          title={t("features.roles.title")}
          description={t("features.roles.description")}
        />
      </div>

      <div className="mt-12 text-center">
        <Button size="lg">
          {t("common.getStarted")}
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 transition-colors duration-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}