'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';

interface VariantTypeSelectProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  excludeIds?: number[];
}

export function VariantTypeSelect({
  value,
  onChange,
  disabled = false,
  excludeIds = [],
}: VariantTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: response } = useVariantTypes({ search });

  const availableTypes = (response?.data || []).filter(
    type => !excludeIds.includes(type.id) && type.status
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline" 
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? 
            availableTypes.find(type => type.id === value)?.name || "Select type" 
            : "Select variant type"
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search variant types..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No variant types found</CommandEmpty>
          <CommandGroup>
            {availableTypes.map((type) => (
              <CommandItem
                key={type.id}
                value={type.id.toString()}
                onSelect={() => {
                  onChange(type.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === type.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {type.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}