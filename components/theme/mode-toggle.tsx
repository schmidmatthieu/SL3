"use client"

import * as React from "react"
import { Moon, Sun, Cloud } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Laptop } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="bg-background/80 backdrop-blur-sm border-primary-100/30 dark:border-primary-800/30"
      >
        <Sun className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30 group overflow-hidden"
        >
          <div className="relative w-4 h-4">
            <div className="absolute inset-0">
              <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary-600" />
              <div className="absolute inset-0 light-mode-effects opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden">
                <Cloud className="absolute -bottom-1.5 -right-2 h-3.5 w-3.5 text-primary-600 fill-primary-500/30 animate-cloud-float" />
              </div>
            </div>
            <div className="absolute inset-0">
              <div className="absolute inset-0 dark-mode-effects opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:block hidden">
                <div className="absolute -right-1 -top-1 w-1 h-1 bg-primary-400/70 rounded-full animate-star-twinkle" style={{ animationDelay: '0.5s' }} />
                <div className="absolute right-2 top-0 w-1 h-1 bg-primary-400/70 rounded-full animate-star-twinkle" />
                <div className="absolute -right-1 bottom-0 w-1 h-1 bg-primary-400/70 rounded-full animate-star-twinkle" style={{ animationDelay: '1s' }} />
              </div>
              <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary-400" />
            </div>
          </div>
          <span className="sr-only">{t('theme.toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer",
            theme === "light" && "bg-primary-50 dark:bg-primary-900"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>{t('theme.mode.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer",
            theme === "dark" && "bg-primary-50 dark:bg-primary-900"
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>{t('theme.mode.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer",
            theme === "system" && "bg-primary-50 dark:bg-primary-900"
          )}
        >
          <Laptop className="mr-2 h-4 w-4" />
          <span>{t('theme.mode.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}