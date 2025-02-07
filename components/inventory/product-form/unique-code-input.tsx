'use client';

import { Input } from "@/components/ui/input";

interface UniqueCodeInputProps {
  form?: string;
  name: string;
  value: string;
  defaultValue: string;
  existingCodes?: string[];
  onChange: (value: string) => void;
  onReset: () => void;
}

export function UniqueCodeInput({
  form,
  name,
  value,
  defaultValue,
  existingCodes = [],
  onChange,
  onReset,
}: UniqueCodeInputProps) {
  return (
    <div className="relative">
      <Input
        form={form}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono pr-16"
        placeholder="0000"
        maxLength={10}
        type="text"
        inputMode="numeric"
        pattern="\d*"
      />
      <button
        type="button"
        onClick={onReset}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}
