'use client';

import { Input } from '@/components/ui/input';
import { validateVariantCode } from '@/lib/utils/sku/variant-code-generator';

interface VariantSkuInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function VariantSkuInput({ 
  value,
  onChange,
  error,
  disabled = false
}: VariantSkuInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (validateVariantCode(newValue) || newValue === '') {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="0000"
        className="w-24 font-mono text-center"
        maxLength={4}
        disabled={disabled}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}