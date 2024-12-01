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
import { useToast } from '@/components/ui/use-toast';
import { useCategories } from '@/lib/hooks/use-categories';
import type { Category } from '@/types/category';

const formSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  parentId: z.string().nullable(),
});

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: Category;
}

export function CategoryForm({ onSuccess, initialData }: CategoryFormProps) {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
      parentId: initialData?.parentId || null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        await updateCategory(initialData.id, values);
        toast({
          title: 'Success',
          description: 'Category has been updated successfully',
        });
      } else {
        await addCategory(values);
        toast({
          title: 'Success',
          description: 'Category has been added successfully',
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the current category and its descendants from parent options
  const getAvailableParents = () => {
    if (!initialData) return categories;

    const getDescendantIds = (categoryId: string): string[] => {
      const children = categories.filter(cat => cat.parentId === categoryId);
      return [
        categoryId,
        ...children.flatMap(child => getDescendantIds(child.id)),
      ];
    };

    const excludeIds = getDescendantIds(initialData.id);
    return categories.filter(cat => !excludeIds.includes(cat.id));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                defaultValue={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {getAvailableParents().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional. Leave empty to create a top-level category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Adding...') 
              : (initialData ? 'Update Category' : 'Add Category')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}