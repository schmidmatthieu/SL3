'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type EventFilters = {
  search: string;
  status: string[];
  sortBy: 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';
};

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ended', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
];

const sortOptions = [
  { value: 'date-desc', label: 'Date (Plus récent)' },
  { value: 'date-asc', label: 'Date (Plus ancien)' },
  { value: 'title-asc', label: 'Titre (A-Z)' },
  { value: 'title-desc', label: 'Titre (Z-A)' },
];

export function EventFilters({ onFiltersChange }: EventFiltersProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<EventFilters['sortBy']>('date-desc');
  const { t } = useTranslation();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      search: value,
      status: selectedStatus,
      sortBy,
    });
  };

  const handleStatusChange = (value: string) => {
    const newStatus = selectedStatus.includes(value)
      ? selectedStatus.filter(s => s !== value)
      : [...selectedStatus, value];

    setSelectedStatus(newStatus);
    onFiltersChange({
      search,
      status: newStatus,
      sortBy,
    });
  };

  const handleSortChange = (value: EventFilters['sortBy']) => {
    setSortBy(value);
    onFiltersChange({
      search,
      status: selectedStatus,
      sortBy: value,
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-4 md:max-w-[600px]">
        <div className="flex-1">
          <Input
            placeholder="Rechercher des événements..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between min-w-[130px]"
            >
              {selectedStatus.length === 0
                ? 'Statut'
                : `${selectedStatus.length} sélectionné${selectedStatus.length > 1 ? 's' : ''}`}
              <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Rechercher un statut..." />
              <CommandEmpty>Aucun statut trouvé.</CommandEmpty>
              <CommandGroup>
                {statusOptions.map(status => (
                  <CommandItem key={status.value} onSelect={() => handleStatusChange(status.value)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedStatus.includes(status.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Select
        value={sortBy}
        onValueChange={value => handleSortChange(value as EventFilters['sortBy'])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
