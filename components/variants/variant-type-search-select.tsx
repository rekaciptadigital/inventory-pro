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
import { useVariantTypes } from '@/lib/hooks/use-variant-types';

interface VariantTypeSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  excludeIds?: string[];
}

export function VariantTypeSearchSelect({
  value,
  onValueChange,
  disabled = false,
  excludeIds = [],
}: VariantTypeSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  // Add debounce to prevent too many API calls
  const debouncedSearch = React.useMemo(() => {
    return search.trim().length >= 1 ? search : undefined;
  }, [search]);

  const { data: response, isLoading, error } = useVariantTypes({ 
    search: debouncedSearch,
    limit: 10 // Add limit to prevent too many results
  });

  // Filter out excluded IDs and inactive variant types
  const filteredTypes = React.useMemo(() => {
    return (response?.data || []).filter(
      type => !excludeIds.includes(type.id) && type.status === true
    );
  }, [response?.data, excludeIds]);

  const selectedType = filteredTypes.find(type => type.id === value);

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
          {selectedType ? selectedType.name : "Select variant type"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}> {/* Disable built-in filtering since we're using API search */}
          <CommandInput
            placeholder="Search variant types..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? (
              "Loading..."
            ) : error ? (
              "Error loading variant types"
            ) : (
              "No variant types found"
            )}
          </CommandEmpty>
          <CommandGroup>
            {filteredTypes.map((type) => (
              <CommandItem
                key={type.id}
                value={type.id}
                onSelect={() => {
                  onValueChange(type.id);
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