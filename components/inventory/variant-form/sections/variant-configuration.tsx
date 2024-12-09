'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { VariantFormValues } from '../variant-form-schema';

interface VariantConfigurationProps {
  selectedVariants: Array<{ typeId: string; values: string[] }>;
  onVariantsChange: (variants: Array<{ typeId: string; values: string[] }>) => void;
  form: UseFormReturn<VariantFormValues>;
}

export function VariantConfiguration({
  selectedVariants,
  onVariantsChange,
  form,
}: VariantConfigurationProps) {
  const { variantTypes } = useVariantTypes();
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const availableTypes = variantTypes.filter(type => 
    type.status === 'active' && 
    !selectedVariants.some(v => v.typeId === type.id)
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
    return type?.name || '';
  };

  const getValueNames = (typeId: string, valueIds: string[]) => {
    const type = variantTypes.find(t => t.id === typeId);
    if (!type) return '';
    
    return valueIds
      .map(id => type.values.find(v => v.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-4">
      {selectedVariants.map((variant, index) => (
        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
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

      {availableTypes.length > 0 && (
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium">Variant Type</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedTypeId
                      ? getVariantTypeName(selectedTypeId)
                      : "Select variant type"}
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
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
              </Popover>
            </div>

            {selectedTypeId && (
              <div>
                <label className="text-sm font-medium">Values</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
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
                          ?.values.map((value) => (
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
      )}
    </div>
  );
}