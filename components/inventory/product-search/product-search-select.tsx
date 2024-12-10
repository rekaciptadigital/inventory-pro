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
import { useProducts } from '@/lib/hooks/use-products';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductSearchSelectProps {
  brandId?: string;
  productTypeId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function ProductSearchSelect({
  brandId,
  productTypeId,
  value,
  onValueChange,
  disabled = false
}: ProductSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { getFilteredProducts, getProductById } = useProducts();

  const filteredProducts = React.useMemo(() => 
    getFilteredProducts(brandId, productTypeId, searchTerm),
    [brandId, productTypeId, searchTerm, getFilteredProducts]
  );

  const selectedProduct = React.useMemo(() => 
    value ? getProductById(value) : undefined,
    [value, getProductById]
  );

  // Reset selection when brand or product type changes
  React.useEffect(() => {
    if (value && selectedProduct) {
      if (brandId && selectedProduct.brand !== brandId) {
        onValueChange('');
      }
      if (productTypeId && selectedProduct.productTypeId !== productTypeId) {
        onValueChange('');
      }
    }
  }, [brandId, productTypeId, value, selectedProduct, onValueChange]);

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
          {selectedProduct ? (
            <span className="truncate">
              {selectedProduct.fullProductName}
              <span className="text-muted-foreground ml-2">
                ({selectedProduct.sku})
              </span>
            </span>
          ) : (
            "Select product..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>
            {!brandId || !productTypeId ? (
              "Please select brand and product type first"
            ) : (
              "No products found"
            )}
          </CommandEmpty>
          <ScrollArea className="h-[200px]">
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onValueChange(product.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{product.fullProductName}</span>
                    <span className="text-sm text-muted-foreground">
                      SKU: {product.sku}
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