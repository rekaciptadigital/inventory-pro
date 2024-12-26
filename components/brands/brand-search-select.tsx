'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBrands } from '@/lib/hooks/use-brands';

interface BrandSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function BrandSearchSelect({
  value,
  onValueChange,
  disabled = false,
}: Readonly<BrandSearchSelectProps>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { brands } = useBrands({ search: searchTerm });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <input
          type="text"
          list="brands"
          value={value ? brands.find((brand) => brand.id.toString() === value)?.name : ''}
          placeholder="Select brand..."
          className="w-full justify-between border border-gray-300 rounded p-2"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          readOnly
        />
        <datalist id="brands">
          {brands.map((brand) => (
            <option key={brand.id} value={brand.name}>
              {brand.name} ({brand.code})
            </option>
          ))}
        </datalist>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search brands..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No brands found</CommandEmpty>
          <ScrollArea className="h-[200px]">
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand.id}
                  value={brand.id.toString()} // Convert to string
                  onSelect={() => {
                    onValueChange(brand.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === brand.id.toString() ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{brand.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Code: {brand.code}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}