'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VariantValueField } from './variant-value-field';
import { useVariantForm } from '@/lib/hooks/variants/use-variant-form';
import type { VariantType, VariantTypeFormData } from '@/types/variant';

interface VariantTypeFormProps {
  onSuccess: () => void;
  initialData?: VariantType;
}

export function VariantTypeForm({ onSuccess, initialData }: VariantTypeFormProps) {
  const { form, isSubmitting, handleSubmit } = useVariantForm(initialData, async (data) => {
    // Submit logic is handled in the parent component
    onSuccess();
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Type Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter variant type name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="Enter display order" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                This determines the order of variants in the product name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <VariantValueField />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Adding...') 
              : (initialData ? 'Update Type' : 'Add Type')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}