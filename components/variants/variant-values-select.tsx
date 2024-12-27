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

interface VariantValuesSelectProps {
  variantTypeId: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function VariantValuesSelect({
  variantTypeId,
  value = [],
  onChange,
  disabled = false,
}: VariantValuesSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: response } = useVariantTypes();
  
  const variantType = response?.data.find(t => t.id === variantTypeId);
  const values = variantType?.values || [];

  const filteredValues = values.filter(v => 
    v.toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (selectedValue: string) => {
    const newValues = value.includes(selectedValue)
      ? value.filter(v => v !== selectedValue)
      : [...value, selectedValue];
    onChange(newValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={disabled || !variantTypeId}
        >
          {value.length > 0
            ? `${value.length} selected`
            : "Select values"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search values..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No values found</CommandEmpty>
          <CommandGroup>
            {filteredValues.map((v) => (
              <CommandItem
                key={v}
                value={v}
                onSelect={() => toggleValue(v)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value.includes(v) ? "opacity-100" : "opacity-0"
                  )}
                />
                {v}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}