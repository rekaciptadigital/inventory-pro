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
import { useToast } from '@/components/ui/use-toast';
import type { Brand } from '@/types/brand';

const formSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
});

interface BrandFormProps {
  onSuccess: (brand: Brand) => void;
}

export function BrandForm({ onSuccess }: BrandFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Create new brand object
      const newBrand: Brand = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get existing brands from localStorage
      const existingBrands = JSON.parse(localStorage.getItem('brands') || '[]');
      
      // Add new brand
      const updatedBrands = [...existingBrands, newBrand];
      
      // Save to localStorage
      localStorage.setItem('brands', JSON.stringify(updatedBrands));

      toast({
        title: 'Success',
        description: 'Brand has been added successfully',
      });

      onSuccess(newBrand);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add brand. Please try again.',
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
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter brand name" {...field} />
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
                  placeholder="Enter brand description (optional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Brand...' : 'Add Brand'}
          </Button>
        </div>
      </form>
    </Form>
  );
}