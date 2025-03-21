'use client';

import { useState } from 'react';
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
import { useLocations } from '@/lib/hooks/locations/use-locations';
import type { Location } from '@/types/location';

interface LocationSelectProps {
  value?: number;
  onValueChange: (value: number | null) => void;
  disabled?: boolean;
  parentId?: number | null;
  placeholder?: string;
  excludeIds?: number[];
}

export function LocationSelect({
  value,
  onValueChange,
  disabled = false,
  parentId,
  placeholder = "Select location...",
  excludeIds = [],
}: Readonly<LocationSelectProps>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const { locations, isLoading } = useLocations();

  // Flatten locations for easier searching
  const flattenLocations = (locations: Location[]): Location[] => {
    let result: Location[] = [];
    locations.forEach(location => {
      result.push(location);
      if (location.children && location.children.length > 0) {
        result = [...result, ...flattenLocations(location.children)];
      }
    });
    return result;
  };

  // Filter locations based on search and exclude IDs
  const filteredLocations = flattenLocations(locations)
    .filter(location => {
      const matchesParent = parentId === undefined || 
        (parentId === null ? !location.parentId : location.parentId === parentId);
      
      const matchesSearch = location.name
        .toLowerCase()
        .includes(search.toLowerCase());
      
      const isExcluded = excludeIds.includes(location.id);
      
      return matchesParent && matchesSearch && !isExcluded;
    });

  const selectedLocation = flattenLocations(locations)
    .find(loc => loc.id === value);

  const getIndentation = (location: Location) => {
    let level = 0;
    const flattened = flattenLocations(locations);
    let current = location;
    
    while (current.parentId) {
      level++;
      const parent = flattened.find(loc => loc.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    
    return level;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedLocation ? (
            <span className="truncate">{selectedLocation.name}</span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search locations..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? "Loading..." : "No locations found"}
          </CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-60">
              {filteredLocations.map((location) => {
                const indentLevel = getIndentation(location);
                
                return (
                  <CommandItem
                    key={location.id}
                    value={location.id.toString()}
                    onSelect={() => {
                      onValueChange(location.id);
                      setOpen(false);
                    }}
                  >
                    <div
                      className="flex items-center w-full"
                      style={{ paddingLeft: `${indentLevel * 12}px` }}
                    >
                      {indentLevel > 0 && (
                        <span className="text-xs text-muted-foreground mr-2">
                          ↳
                        </span>
                      )}
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === location.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{location.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {location.code}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
              {filteredLocations.length === 0 && !isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No locations found
                </div>
              )}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}