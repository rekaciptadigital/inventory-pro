'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, X, Check } from 'lucide-react';
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
import { ProductFormValues } from '../../product-form/form-schema';

interface Variant {
  typeId: string;
  values: string[];
}

interface VariantValue {
  id: string;
  name: string;
}

interface VariantConfigurationProps {
  selectedVariants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  form: UseFormReturn<ProductFormValues>;
}

export function VariantConfiguration({
  selectedVariants,
  onVariantsChange,
  form,
}: Readonly<VariantConfigurationProps>) {
  const { variantTypes = [] } = useVariantTypes() || {}; // Fallback to empty array
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const availableTypes = variantTypes.filter(type => 
    type.status === 'active' && 
    !selectedVariants.some((v: Variant) => v.typeId === type.id)
  );

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

  const handleRemoveVariant = (index: number) => {
    const newVariants = selectedVariants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };

  const toggleValue = (valueId: string) => {
    setSelectedValues(current =>
      current.includes(valueId)
        ? current.filter(id => id !== valueId)
        : [...current, valueId]
    );
  };

  const getVariantTypeName = (typeId: string) => {
    const type = variantTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type'; // Fallback to 'Unknown Type'
  };

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

      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-4">
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
                  disabled={availableTypes.length === 0} // Disabled if no available types
                >
                  {selectedTypeId
                    ? getVariantTypeName(selectedTypeId)
                    : "Select variant type"}
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              {availableTypes.length > 0 && (
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search variant type..." />
                    <CommandEmpty>No variant type found.</CommandEmpty>
                    <CommandGroup>
                      {availableTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.id}
                          onSelect={() => {
                            setSelectedTypeId(type.id);
                            setSelectedValues([]);
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
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
          </div>

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
                    disabled={availableTypes.length === 0} // Disabled if no available types
                  >
                    {selectedValues.length > 0
                      ? `${selectedValues.length} selected`
                      : "Select values"}
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search values..." />
                    <CommandEmpty>No values found.</CommandEmpty>
                    <CommandGroup>
                      {variantTypes
                        .find(t => t.id === selectedTypeId)
                        ?.values.map((value: VariantValue) => (
                          <CommandItem
                            key={value.id}
                            value={value.id}
                            onSelect={() => toggleValue(value.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedValues.includes(value.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {value.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

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
