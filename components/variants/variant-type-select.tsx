'use client';

/**
 * Komponen VariantTypeSelect
 * Menampilkan dropdown untuk pemilihan tipe varian dengan fitur pencarian
 * 
 * Props:
 * @param value - ID tipe varian yang terpilih
 * @param onChange - Callback function saat tipe varian dipilih
 * @param disabled - Status disabled dari dropdown
 * @param excludeIds - Array ID tipe varian yang tidak ditampilkan
 */

/**
 * State Management:
 * - open: Mengontrol visibility dari popover
 * - search: Menyimpan kata kunci pencarian
 * 
 * Data Fetching:
 * - Menggunakan useVariantTypes hook untuk mengambil data
 * - Memfilter tipe varian berdasarkan excludeIds dan status
 */

/**
 * Komponen UI:
 * - Popover: Wrapper untuk dropdown
 * - Command: Komponen untuk searchable dropdown
 * - Button: Trigger untuk membuka dropdown
 * 
 * Flow:
 * 1. User membuka dropdown
 * 2. Data tipe varian di-fetch
 * 3. User bisa mencari dengan mengetik
 * 4. Saat item dipilih, dropdown tertutup dan onChange dipanggil
 */
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
  const { data: response, isLoading, error } = useVariantTypes({ search });

  const availableTypes = (response?.data || []).filter(
    type => !excludeIds.includes(type.id) && type.status
  );

  const selectedType = availableTypes.find(type => type.id === value);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  if (error) {
    return (
      <Button
        variant="outline" 
        className="w-full justify-between text-destructive"
        disabled
      >
        Error loading variant types
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline" 
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : selectedType ? (
            selectedType.name
          ) : (
            "Select variant type"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search variant types..."
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <CommandGroup>
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Loading...</span>
              </div>
            </CommandGroup>
          ) : availableTypes.length === 0 ? (
            <CommandEmpty>
              {search ? "No variant types found" : "No variant types available"}
            </CommandEmpty>
          ) : (
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
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}