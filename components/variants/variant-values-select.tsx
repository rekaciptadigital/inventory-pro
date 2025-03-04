'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';

interface VariantValuesSelectProps {
  readonly variantTypeId: number;
  readonly value: readonly string[];
  readonly onChange: (value: string[]) => void;
  readonly disabled?: boolean;
}

export function VariantValuesSelect({
  variantTypeId,
  value = [],
  onChange,
  disabled = false,
}: Readonly<VariantValuesSelectProps>) {
  const [search, setSearch] = useState('');
  const { variantTypes } = useVariantTypes();
  
  const variantType = variantTypes.find(t => t.id === variantTypeId);
  const values = variantType?.values || [];

  const filteredValues = values.filter(v => 
    v.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(opt => opt.value);
    onChange(selectedOptions);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search values..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 mb-2 border rounded-md"
        disabled={disabled || !variantTypeId}
      />
      <select
        multiple
        value={value}
        onChange={handleSelectionChange}
        className={cn(
          "w-full min-h-[120px] border rounded-md p-1",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled || !variantTypeId}
        aria-label="Select variant values"
      >
        {filteredValues.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <div className="mt-2 text-sm text-muted-foreground">
        {value.length} values selected
      </div>
    </div>
  );
}