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
});

interface ParentCategoryFormProps {
  onSuccess: () => void;
  initialData?: Category;
}

export function ParentCategoryForm({ onSuccess, initialData }: ParentCategoryFormProps) {
  const { toast } = useToast();
  const { addCategory, updateCategory } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        await updateCategory(initialData.id, { ...values, parentId: null });
        toast({
          title: 'Success',
          description: 'Parent category has been updated successfully',
        });
      } else {
        await addCategory({ ...values, parentId: null });
        toast({
          title: 'Success',
          description: 'Parent category has been added successfully',
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter parent category name" {...field} />
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

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Adding...') 
              : (initialData ? 'Update Parent Category' : 'Add Parent Category')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}