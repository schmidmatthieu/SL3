"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { ScrollArea } from "./scroll-area"
import { Badge } from "./badge"

export type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  id?: string
  options: Option[]
  selected: Option[]
  onChange: (values: Option[]) => void
  placeholder?: string
  className?: string
  isLoading?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
}

export function MultiSelect({
  id,
  options,
  selected = [],
  onChange,
  placeholder = "Select options...",
  className,
  isLoading = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (option: Option) => {
    const isSelected = selected.some((item) => item.value === option.value)
    if (isSelected) {
      onChange(selected.filter((item) => item.value !== option.value))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selected.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1"
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-60">
              {options.map((option) => {
                const isSelected = selected.some(
                  (item) => item.value === option.value
                )
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                    className="flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </CommandItem>
                )
              })}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
