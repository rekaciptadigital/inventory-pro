'use client';

import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { generateSequentialCode } from '@/lib/utils/sku/variant-code-generator';

interface VariantSkuFieldProps {
  index: number;
  mainSku: string;
  uniqueCode: string;
  error?: string;
  onUniqueCodeChange: (code: string) => void;
  onReset: () => void;
}

export function VariantSkuField({
  index,
  mainSku,
  uniqueCode,
  error,
  onUniqueCodeChange,
  onReset,
}: VariantSkuFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    onUniqueCodeChange(newValue);
  };

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
        <FormLabel className="flex justify-between">
          <span>Unique Code</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={onReset}
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </FormLabel>
        <FormControl>
          <Input
            type="text"
            value={uniqueCode}
            onChange={handleChange}
            placeholder="0000"
            className="font-mono text-center"
            maxLength={4}
          />
        </FormControl>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <FormDescription>
            Enter a unique 4-digit code or use the default sequential number
          </FormDescription>
        )}
      </FormItem>
    </div>
  );
}