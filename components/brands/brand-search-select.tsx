'use client';

// Import komponen dan hooks yang dibutuhkan
import React, { useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBrands } from '@/lib/hooks/use-brands';

// Interface untuk props komponen
interface BrandSearchSelectProps {
  value?: string;              // ID brand yang terpilih
  onValueChange: (value: string) => void;  // Callback saat brand dipilih
  disabled?: boolean;          // Status disabled komponen
}

/**
 * Komponen BrandSearchSelect
 * 
 * Komponen ini menampilkan dropdown pencarian brand dengan fitur:
 * - Pencarian brand berdasarkan nama
 * - Menampilkan kode dan nama brand
 * - Lazy loading data brand menggunakan custom hook useBrands
 * 
 * @param props BrandSearchSelectProps
 */
export function BrandSearchSelect({
  value,
  onValueChange,
  disabled = false,
}: Readonly<BrandSearchSelectProps>) {
  // State untuk mengontrol popup dropdown
  const [open, setOpen] = useState(false);
  // State untuk menyimpan kata kunci pencarian
  const [searchTerm, setSearchTerm] = useState('');
  // Mengambil data brand menggunakan custom hook
  const { brands } = useBrands({ search: searchTerm });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Tombol trigger untuk membuka dropdown */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">
                {brands.find((brand) => brand.id.toString() === value)?.name ?? 'Select brand...'}
              </span>
              {value && (
                <span className="text-muted-foreground text-sm">
                  ({brands.find((brand) => brand.id.toString() === value)?.code})
                </span>
              )}
            </span>
          ) : (
            'Select brand...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* Konten dropdown */}
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          {/* Input pencarian brand */}
          <CommandInput
            placeholder="Search brands..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          
          {/* Pesan saat tidak ada brand yang ditemukan */}
          <CommandEmpty>No brands found</CommandEmpty>

          {/* Area scroll untuk daftar brand */}
          <ScrollArea className="h-[200px]">
            <CommandGroup>
              {/* Mapping data brand menjadi item yang dapat dipilih */}
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