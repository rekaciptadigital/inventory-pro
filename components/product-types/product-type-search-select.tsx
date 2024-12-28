'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductTypeList } from '@/lib/hooks/product-types/use-product-type-list';

interface ProductTypeSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function ProductTypeSearchSelect({
  value,
  onValueChange,
  disabled = false,
}: Readonly<ProductTypeSearchSelectProps>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  const { data: response, isLoading } = useProductTypeList({ 
    search,
    limit: 10 
  });

  const productTypes = React.useMemo(() => {
    return (response?.data || []).filter(type => type.status === true);
  }, [response?.data]);

  const selectedType = productTypes.find(type => type.id.toString() === value);

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
          {selectedType ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedType.name}</span>
              <span className="text-muted-foreground text-sm">
                ({selectedType.code})
              </span>
            </span>
          ) : (
            'Select product type...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search product types..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? "Loading..." : "No product types found"}
          </CommandEmpty>
          <ScrollArea className="h-[200px]">
            <CommandGroup>
              {productTypes.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.id.toString()}
                  onSelect={() => {
                    onValueChange(type.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === type.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{type.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Code: {type.code}
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