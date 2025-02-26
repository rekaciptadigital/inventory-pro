import React from 'react';
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';

interface SkuFormGroupProps {
  readonly originalSkuKey: string;
  readonly skuKey: string;
  readonly uniqueCode: string;
  readonly localValues: Readonly<Record<string, string>>;
  readonly handleUniqueCodeChange: (originalSkuKey: string, value: string) => void;
  readonly handleInputBlur: (originalSkuKey: string, value: string) => void;
  readonly handleResetUniqueCode: (originalSkuKey: string) => void;
  readonly handleVendorSkuChange: (originalSkuKey: string, value: string) => void;
  readonly handleVendorSkuBlur: (originalSkuKey: string, value: string) => void;
}

export function SkuFormGroup({
  originalSkuKey,
  skuKey,
  uniqueCode,
  localValues,
  handleUniqueCodeChange,
  handleInputBlur,
  handleResetUniqueCode,
  handleVendorSkuChange,
  handleVendorSkuBlur
}: SkuFormGroupProps) {
  const inputValue = localValues[originalSkuKey] ?? uniqueCode;
  const formGroupId = `variant-group-${originalSkuKey}`;

  return (
    <fieldset id={formGroupId} className="grid grid-cols-3 gap-4">
      <legend className="sr-only">SKU variant details for {skuKey}</legend>
      <FormItem className="space-y-2">
        <FormControl>
          <div className="space-y-1">
            <FormLabel htmlFor={`sku-variant-${originalSkuKey}`}>SKU Variant</FormLabel>
            <Input
              id={`sku-variant-${originalSkuKey}`}
              name={`sku-variant-${originalSkuKey}`}
              value={skuKey}
              className="font-mono bg-muted"
              readOnly
            />
          </div>
        </FormControl>
        <FormDescription>
          Generated SKU based on main SKU and unique code
        </FormDescription>
      </FormItem>

      <FormItem className="space-y-2">
        <FormControl>
          <div className="space-y-1">
            <FormLabel htmlFor={`unique-code-${originalSkuKey}`}>Unique Code</FormLabel>
            <div className="relative">
              <Input
                id={`unique-code-${originalSkuKey}`}
                name={`unique-code-${originalSkuKey}`}
                value={inputValue}
                onChange={(e) => handleUniqueCodeChange(originalSkuKey, e.target.value)}
                onBlur={(e) => handleInputBlur(originalSkuKey, e.target.value)}
                className="font-mono pr-8"
                placeholder="0000"
                maxLength={10}
                type="text"
                inputMode="numeric"
                pattern="\d*"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={() => handleResetUniqueCode(originalSkuKey)}
                title="Reset to default"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FormControl>
        <FormDescription>
          Enter 1-10 numeric or use the default code
        </FormDescription>
      </FormItem>

      <FormItem className="space-y-2">
        <FormControl>
          <div className="space-y-1">
            <FormLabel htmlFor={`vendor-sku-${originalSkuKey}`}>Vendor SKU</FormLabel>
            <Input
              id={`vendor-sku-${originalSkuKey}`}
              name={`vendor-sku-${originalSkuKey}`}
              value={localValues[`vendor-${originalSkuKey}`] || ''}
              onChange={(e) => handleVendorSkuChange(originalSkuKey, e.target.value.slice(0, 50))}
              onBlur={(e) => handleVendorSkuBlur(originalSkuKey, e.target.value)}
              placeholder="(Optional)"
              maxLength={50}
            />
          </div>
        </FormControl>
        <FormDescription>Optional vendor reference number</FormDescription>
      </FormItem>
    </fieldset>
  );
}
