'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { ProductType, ProductTypeFormData } from '@/types/product-type';

const formSchema = z.object({
  name: z.string().min(1, 'Product type name is required'),
  code: z.string().min(1, 'Product type code is required'),
  description: z.string().optional(),
  status: z.boolean().default(true),
});

interface ProductTypeFormProps {
  onSubmit: (data: ProductTypeFormData) => Promise<void>;
  initialData?: ProductType;
  isSubmitting?: boolean;
}

export function ProductTypeForm({ onSubmit, initialData, isSubmitting }: ProductTypeFormProps) {
  const form = useForm<ProductTypeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      status: initialData?.status ?? true,
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
              <FormLabel>Product Type Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product type name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter product type code" 
                  {...field}
                  className="uppercase"
                />
              </FormControl>
              <FormDescription>
                Enter a unique code using letters and numbers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product type description (optional)"
                  value={field.value || ''}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
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
                  Product type will {field.value ? 'be visible' : 'not be visible'} in the system
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
              : (initialData ? 'Update Type' : 'Create Type')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}