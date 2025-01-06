"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { Spinner } from "./spinner"

export type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  id?: string
  options: Option[]
  value: Option[]
  onChange: (values: Option[]) => void
  placeholder?: string
  className?: string
  isLoading?: boolean
}

export function MultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  isLoading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (optionToRemove: Option) => {
    onChange(value.filter((opt) => opt.value !== optionToRemove.value))
  }

  const handleSelect = (optionToAdd: Option) => {
    const isAlreadySelected = value.some((opt) => opt.value === optionToAdd.value)
    if (!isAlreadySelected) {
      onChange([...value, optionToAdd])
    }
    setInputValue("")
    setOpen(false)
  }

  const filteredOptions = options.filter((option) => 
    !value.some((selected) => selected.value === option.value) &&
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <div className="relative w-full">
      <div
        className={`relative flex min-h-[38px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${className}`}
        onClick={() => setOpen(true)}
      >
        <div className="flex flex-wrap gap-1">
          {value.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {option.label}
              <button
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleUnselect(option)
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {value.length === 0 && !isLoading && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {isLoading && (
            <div className="flex items-center">
              <Spinner className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
      {open && (
        <Command className="absolute z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <div className="flex items-center border-b px-3">
            <CommandPrimitive.Input
              id={id}
              value={inputValue}
              onValueChange={setInputValue}
              placeholder={placeholder}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandGroup className="max-h-[200px] overflow-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option)}
                  className="cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No results found</CommandItem>
            )}
          </CommandGroup>
        </Command>
      )}
    </div>
  )
}
