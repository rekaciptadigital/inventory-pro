'use client';

import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UniqueCodeInput } from '../unique-code-input';
import { Switch } from "@/components/ui/switch";

interface VariantSkuFieldProps {
  index: number;
  mainSku: string;
  uniqueCode: string;
  defaultUniqueCode: string;
  existingCodes: string[];
  error?: string;
  status?: boolean;  // Add status prop
  onUniqueCodeChange: (code: string) => void;
  onReset: () => void;
  onStatusChange?: (checked: boolean) => void;  // Add status change handler
}

export function VariantSkuField({
  index,
  mainSku,
  uniqueCode,
  defaultUniqueCode,
  existingCodes,
  error,
  status = true,  // Default to true
  onUniqueCodeChange,
  onReset,
  onStatusChange,
}: VariantSkuFieldProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
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

      <FormItem>
        <FormLabel>Status</FormLabel>
        <FormControl>
          <Switch
            checked={status ?? true}
            onCheckedChange={onStatusChange}
            aria-label="Toggle variant status"
          />
        </FormControl>
        <FormDescription>
          Toggle to enable or disable this variant
        </FormDescription>
      </FormItem>
    </div>
  );
}