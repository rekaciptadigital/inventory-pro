'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import {
  isValidUniqueCode,
  formatUniqueCode,
  isUniqueCode,
  sanitizeUniqueCode,
} from '@/lib/utils/validation/unique-code';

interface UniqueCodeInputProps {
  value: string;
  defaultValue: string;
  existingCodes: string[];
  onChange: (value: string) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function UniqueCodeInput({
  value,
  defaultValue,
  existingCodes,
  onChange,
  onReset,
  disabled = false,
}: UniqueCodeInputProps) {
  const [error, setError] = useState<string>('');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    validateInput(value);
  }, [value, existingCodes]);

  const validateInput = (input: string) => {
    if (!isValidUniqueCode(input)) {
      setError('Code must be 1-10 alphanumeric characters');
      return false;
    }

    const formattedCode = formatUniqueCode(input);
    if (!isUniqueCode(formattedCode, existingCodes.filter(code => code !== value))) {
      setError('This code is already in use');
      return false;
    }

    setError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = sanitizeUniqueCode(e.target.value);
    setIsModified(true);
    onChange(sanitizedInput);
  };

  const handleReset = () => {
    setIsModified(false);
    setError('');
    onReset();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter unique code"
          className={`font-mono ${error ? 'border-destructive' : ''}`}
          disabled={disabled}
          maxLength={10}
        />
        {isModified && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleReset}
            disabled={disabled}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}