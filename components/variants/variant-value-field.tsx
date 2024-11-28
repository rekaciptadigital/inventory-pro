'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export function VariantValueField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="valuesString"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Variant Values</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter values separated by commas (e.g., Red, Blue, Green)"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Enter each value separated by a comma. The values will be automatically ordered as entered.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}