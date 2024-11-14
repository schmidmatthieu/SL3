"use client";

import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-6 w-6" />
          <span className="text-xl font-bold">SL3</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ThemeToggle />
          <Button variant="default" size="sm">
            {t("common.signIn")}
          </Button>
        </div>
      </div>
    </header>
  );
}