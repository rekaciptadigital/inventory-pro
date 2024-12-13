'use client';

import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UniqueCodeInput } from '../unique-code-input';

interface VariantSkuFieldProps {
  index: number;
  mainSku: string;
  uniqueCode: string;
  defaultUniqueCode: string;
  existingCodes: string[];
  error?: string;
  onUniqueCodeChange: (code: string) => void;
  onReset: () => void;
}

export function VariantSkuField({
  index,
  mainSku,
  uniqueCode,
  defaultUniqueCode,
  existingCodes,
  error,
  onUniqueCodeChange,
  onReset,
}: VariantSkuFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormItem>
        <FormLabel>SKU Variant</FormLabel>
        <FormControl>
          <Input
            value={`${mainSku}-${uniqueCode}`}
            className="font-mono bg-muted"
            readOnly
          />
        </FormControl>
        <FormDescription>
          Generated SKU based on main SKU and unique code
        </FormDescription>
      </FormItem>

      <FormItem>
        <FormLabel>Unique Code</FormLabel>
        <FormControl>
          <UniqueCodeInput
            value={uniqueCode}
            defaultValue={defaultUniqueCode}
            existingCodes={existingCodes}
            onChange={onUniqueCodeChange}
            onReset={onReset}
          />
        </FormControl>
        <FormDescription>
          Enter 1-10 alphanumeric characters or use the default code
        </FormDescription>
      </FormItem>
    </div>
  );
}