'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { variantFormSchema, type VariantFormData } from '@/lib/validations/variant';
import type { Variant } from '@/types/variant';

interface VariantFormProps {
  onSubmit: (data: VariantFormData) => Promise<void>;
  initialData?: Variant;
  isSubmitting?: boolean;
}

export function VariantForm({ onSubmit, initialData, isSubmitting }: VariantFormProps) {
  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      display_order: initialData?.display_order || 1,
      status: initialData?.status ?? true,
      values: initialData?.values.join(', ') || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter variant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter display order"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="values"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Values</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter values separated by commas (e.g., Red, Blue, Green)"
                  value={field.value || ''}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter each value separated by a comma
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Variant will {field.value ? 'be visible' : 'not be visible'} in the system
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Creating...') 
              : (initialData ? 'Update Variant' : 'Create Variant')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}