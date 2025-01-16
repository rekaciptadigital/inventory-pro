import React, { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { useQuery } from '@tanstack/react-query';

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
  const [search, setSearch] = useState('');
  const { getBrands } = useBrands();
  
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['brands', { search }],
    queryFn: () => getBrands({ search, limit: 10 }),
    enabled: open && search.length >= 2,
    staleTime: 30000, // Cache results for 30 seconds
    placeholderData: (previousData) => previousData,
  });

  const brands = response?.data || [];
  const selectedBrand = brands.find(brand => brand.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedBrand ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedBrand.name}</span>
              <span className="text-muted-foreground text-sm">
                ({selectedBrand.code})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                'Select brand...'
              )}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search brands..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-destructive">
                Error loading brands
              </div>
            ) : search.length < 2 ? (
              'Enter at least 2 characters to search'
            ) : (
              'No brands found'
            )}
          </CommandEmpty>
          <ScrollArea className="h-[200px]">
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand.id}
                  value={brand.id.toString()}
                  onSelect={() => {
                    onValueChange(brand.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === brand.id.toString() ? 'opacity-100' : 'opacity-0'
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