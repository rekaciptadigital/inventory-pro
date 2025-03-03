'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UseFormReturn } from 'react-hook-form';
import { Plus, X, Check, Loader2 } from 'lucide-react';
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
import { useVariants } from '@/lib/hooks/variants/use-variants';
import { ProductFormValues } from '../../product-form/form-schema';
import { useToast } from '@/components/ui/use-toast';

// Interface untuk struktur data varian
interface Variant {
  typeId: string;
  values: string[];
}

// Interface untuk struktur nilai varian
interface VariantValue {
  id: string;
  name: string;
}

// Interface props untuk komponen VariantConfiguration
interface VariantConfigurationProps {
  selectedVariants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  form: UseFormReturn<ProductFormValues>;
}

// Komponen utama untuk menangani konfigurasi varian produk
export function VariantConfiguration({
  selectedVariants,
  onVariantsChange,
  form,
}: Readonly<VariantConfigurationProps>) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const loadMoreRef = useRef(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const { 
    data: variantsResponse,
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetching 
  } = useInfiniteQuery({
    queryKey: ['variants', { search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) => getVariants({ 
      search: debouncedSearch,
      page: pageParam,
      limit: 10,
      status: true 
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    keepPreviousData: true
  });

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetching && hasNextPage) {
          setPage(prev => prev + 1);
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMoreRef, isFetching, hasNextPage, fetchNextPage]);

  // Flatten and combine all pages of variants
  const variants = useMemo(() => {
    return variantsResponse?.pages.flatMap(page => page.data) ?? [];
  }, [variantsResponse]);

  // Sort variants by display_order
  const sortedVariants = useMemo(() => {
    return [...variants].sort((a, b) => a.display_order - b.display_order);
  }, [variants]);

  // Filter tipe varian yang tersedia dengan mengecualikan yang sudah dipilih
  const availableTypes = sortedVariants.filter(type => 
    !selectedVariants.some((v: Variant) => v.typeId === type.id)
  );

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load variant types"
    });
  }

  // Fungsi untuk menambahkan kombinasi varian baru
  const handleAddVariant = () => {
    if (selectedTypeId && selectedValues.length > 0) {
      const newVariants = [
        ...selectedVariants,
        { typeId: selectedTypeId, values: selectedValues }
      ];
      onVariantsChange(newVariants);
      setSelectedTypeId('');
      setSelectedValues([]);
    }
  };

  // Fungsi untuk menghapus varian yang sudah ada
  const handleRemoveVariant = (index: number) => {
    const newVariants = selectedVariants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };

  // Fungsi untuk mengubah status pemilihan nilai varian
  const toggleValue = (valueId: string) => {
    setSelectedValues(current =>
      current.includes(valueId)
        ? current.filter(id => id !== valueId)
        : [...current, valueId]
    );
  };

  // Fungsi pembantu untuk mendapatkan nama tipe varian berdasarkan ID
  const getVariantTypeName = (typeId: string) => {
    const type = variantTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type'; // Fallback to 'Unknown Type'
  };

  // Fungsi pembantu untuk mendapatkan teks tombol pemilihan tipe varian
  const getVariantTypeButtonText = () => {
    if (availableTypes.length === 0) {
      return "No available variant type";
    }
    if (selectedTypeId) {
      return getVariantTypeName(selectedTypeId);
    }
    return "Select variant type";
  };

  // Fungsi pembantu untuk mendapatkan daftar nama nilai varian yang dipisahkan koma
  const getValueNames = (typeId: string, valueIds: string[]) => {
    const type = variantTypes.find(t => t.id === typeId);
    if (!type) return '';

    return valueIds
      .map(id => type.values.find((v: VariantValue) => v.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Menampilkan varian yang sudah dipilih dengan opsi hapus */}
      {selectedVariants.map((variant, index) => (
        <div 
          key={`${variant.typeId}-${variant.values.join('-')}`} 
          className="flex items-center gap-4 p-4 border rounded-lg"
        >
          <div className="flex-1">
            <p className="font-medium">{getVariantTypeName(variant.typeId)}</p>
            <p className="text-sm text-muted-foreground">
              {getValueNames(variant.typeId, variant.values)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveVariant(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {isLoading ? (
        <div className="flex items-center justify-center p-4 border rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Loading variants...</span>
        </div>
      ) : error ? (
        <div className="p-4 border border-destructive text-destructive rounded-lg">
          Failed to load variants. Please try again.
        </div>
      ) : (

      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-4">
          {/* Bagian Pemilihan Tipe Varian */}
          <div>
            <label htmlFor="variant-type" className="text-sm font-medium">
              Variant Type
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="variant-type"
                  variant="outline"
                  className="w-full justify-between"
                  disabled={availableTypes.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <>
                      {getVariantTypeButtonText()}
                      <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              {availableTypes.length > 0 && (
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search variant type..." 
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandEmpty>
                      {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading variants...</span>
                        </div>
                      ) : (
                        "No variant type found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {sortedVariants.map((type) => (
                          <CommandItem
                            key={type.id}
                            value={type.id}
                            onSelect={() => {
                              setSelectedTypeId(type.id);
                              setSelectedValues([]);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTypeId === type.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {type.name}
                          </CommandItem>
                        ))}
                        {isFetching && (
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            Loading more...
                          </div>
                        )}
                        <div ref={loadMoreRef} className="h-1" />
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
          </div>

          {/* Bagian Pemilihan Nilai Varian - Hanya ditampilkan ketika tipe sudah dipilih */}
          {selectedTypeId && (
            <div>
              <label htmlFor="variant-values" className="text-sm font-medium">
                Values
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="variant-values"
                    variant="outline"
                    className="w-full justify-between"
                    aria-expanded={open}
                    disabled={!selectedTypeId || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : selectedValues.length > 0 ? (
                      `${selectedValues.length} selected`
                    ) : (
                      "Select values"
                    )}
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search values..." />
                    <CommandEmpty>No values found.</CommandEmpty>
                    <CommandGroup>
                      {sortedVariants
                        .find(t => t.id === selectedTypeId)
                        ?.values.map((value) => (
                          <CommandItem
                            key={value}
                            value={value}
                            onSelect={() => toggleValue(value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedValues.includes(value) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {value}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground mt-1">
                Select one or more values for this variant type
              </p>
            </div>
          )}
        </div>

        {/* Tombol Tambah Varian */}
        <Button
          type="button"
          onClick={handleAddVariant}
          disabled={!selectedTypeId || selectedValues.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>
    </div>
  );
}
