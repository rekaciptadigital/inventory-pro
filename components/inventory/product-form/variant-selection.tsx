'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';

export function VariantSelection() {
  const { getActiveVariantTypes } = useVariantTypes();
  const { control, watch, setValue } = useFormContext();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  
  const activeVariantTypes = getActiveVariantTypes();
  const selectedVariantTypes = watch('variants') || [];

  const handleAddVariant = () => {
    setValue('variants', [...selectedVariantTypes, { typeId: '', values: [] }]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...selectedVariantTypes];
    newVariants.splice(index, 1);
    setValue('variants', newVariants);
  };

  const getAvailableVariantTypes = (currentIndex: number) => {
    const selectedIds = selectedVariantTypes
      .map((v: any, i: number) => i !== currentIndex ? v.typeId : null)
      .filter(Boolean);
    return activeVariantTypes.filter(type => !selectedIds.includes(type.id));
  };

  const toggleValue = (variantIndex: number, value: string) => {
    const currentValues = watch(`variants.${variantIndex}.values`) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    setValue(`variants.${variantIndex}.values`, newValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Product Variants (Optional)</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVariant}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {selectedVariantTypes.map((variant: any, index: number) => (
        <div key={index} className="flex gap-4 items-start">
          <FormField
            control={control}
            name={`variants.${index}.typeId`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {field.value
                          ? activeVariantTypes.find((type) => type.id === field.value)?.name
                          : "Select variant type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search variant type..." />
                        <CommandEmpty>No variant type found.</CommandEmpty>
                        <CommandGroup>
                          {getAvailableVariantTypes(index).map((type) => (
                            <CommandItem
                              key={type.id}
                              value={type.id}
                              onSelect={() => {
                                field.onChange(type.id);
                                setValue(`variants.${index}.values`, []);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === type.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {type.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {variant.typeId && (
            <FormField
              control={control}
              name={`variants.${index}.values`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Popover
                      open={open[index]}
                      onOpenChange={(isOpen) => 
                        setOpen(prev => ({ ...prev, [index]: isOpen }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {field.value?.length 
                            ? `${field.value.length} selected`
                            : "Select values"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search values..." />
                          <CommandEmpty>No values found.</CommandEmpty>
                          <CommandGroup>
                            {activeVariantTypes
                              .find(type => type.id === variant.typeId)
                              ?.values.map((value) => (
                                <CommandItem
                                  key={value.id}
                                  value={value.id}
                                  onSelect={() => toggleValue(index, value.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(value.id) 
                                        ? "opacity-100" 
                                        : "opacity-0"
                                    )}
                                  />
                                  {value.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveVariant(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}