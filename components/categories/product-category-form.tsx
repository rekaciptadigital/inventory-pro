'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ProductCategory } from '@/types/product-category';

const formSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parent_id: z.number().nullable(),
  status: z.boolean().default(true),
});

interface ProductCategoryFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  categories: ProductCategory[];
  onClose: () => void;
  isSubmitting?: boolean;
}

export function ProductCategoryForm({
  onSubmit,
  categories,
  onClose,
  isSubmitting = false,
}: ProductCategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: null,
      status: true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // Flatten categories for the select input
  const flattenCategories = (
    cats: ProductCategory[],
    level = 0,
    result: Array<{ id: number; name: string; level: number }> = []
  ) => {
    cats.forEach(cat => {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children?.length) {
        flattenCategories(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
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
                  placeholder="Enter category description (optional)"
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
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None (Top Level)</SelectItem>
                  {flatCategories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id.toString()}
                      className="pl-[var(--indent)]"
                      style={{ '--indent': `${category.level * 1.5}rem` } as any}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Leave empty to create a top-level category
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
                  Category will {field.value ? 'be visible' : 'not be visible'} in the system
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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}