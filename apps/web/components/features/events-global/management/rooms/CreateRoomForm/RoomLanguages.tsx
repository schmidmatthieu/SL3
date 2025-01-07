'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Label } from '@/components/core/ui/label';
import { Badge } from '@/components/core/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/core/ui/dropdown-menu';
import { AVAILABLE_LANGUAGES } from '@/types/room-management.types';
import { cn } from '@/lib/utils';

interface RoomLanguagesProps {
  originalLanguage: string;
  availableLanguages: string[];
  onOriginalLanguageChange: (value: string) => void;
  onAvailableLanguagesChange: (values: string[]) => void;
}

export function RoomLanguages({
  originalLanguage,
  availableLanguages,
  onOriginalLanguageChange,
  onAvailableLanguagesChange,
}: RoomLanguagesProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Original Language (VO)</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {originalLanguage}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {AVAILABLE_LANGUAGES.map((lang, index) => (
              <DropdownMenuItem
                key={`original-lang-${lang.code}-${index}`}
                onSelect={e => {
                  e.preventDefault();
                  onOriginalLanguageChange(lang.code);
                }}
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label>Available Languages</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {availableLanguages.length
                ? `${availableLanguages.length} languages selected`
                : 'Select languages'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {AVAILABLE_LANGUAGES.map((lang, index) => (
              <DropdownMenuItem
                key={`available-lang-${lang.code}-${index}`}
                disabled={lang.code === originalLanguage}
                onSelect={e => {
                  e.preventDefault();
                  if (lang.code === originalLanguage) {
                    onAvailableLanguagesChange(availableLanguages.filter(l => l !== lang.code));
                  } else if (!availableLanguages.includes(lang.code)) {
                    onAvailableLanguagesChange([...availableLanguages, lang.code]);
                  } else {
                    onAvailableLanguagesChange(availableLanguages.filter(l => l !== lang.code));
                  }
                }}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      'mr-2 h-4 w-4 rounded-sm border border-primary',
                      availableLanguages.includes(lang.code)
                        ? 'bg-primary'
                        : 'bg-transparent'
                    )}
                  />
                  <span>{lang.label}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {availableLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {availableLanguages.map((lang, index) => (
              <Badge
                key={`selected-lang-${lang}-${index}`}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  onAvailableLanguagesChange(availableLanguages.filter(l => l !== lang))
                }
              >
                <span>
                  {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.label}
                </span>
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
