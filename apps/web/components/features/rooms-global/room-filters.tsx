'use client';

import { Language } from '@/types/room';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/core/ui/badge';

interface RoomFiltersProps {
  selectedLanguages: Language[];
  onLanguageToggle: (language: Language) => void;
}

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

export function RoomFilters({ selectedLanguages, onLanguageToggle }: RoomFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {languages.map(({ code, label }) => (
        <Badge
          key={code}
          variant="outline"
          className={cn(
            'cursor-pointer hover:bg-primary/10 transition-colors',
            selectedLanguages.includes(code) && 'bg-primary/20 hover:bg-primary/30'
          )}
          onClick={() => onLanguageToggle(code)}
        >
          {label}
        </Badge>
      ))}
    </div>
  );
}
