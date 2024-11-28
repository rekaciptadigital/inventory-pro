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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { VariantValueField } from './variant-value-field';
import type { VariantType } from '@/types/variant';

const formSchema = z.object({
  name: z.string().min(1, 'Variant type name is required'),
  status: z.enum(['active', 'inactive']),
  valuesString: z.string().min(1, 'At least one value is required'),
  values: z.array(z.object({
    name: z.string(),
    details: z.string().optional(),
    order: z.number(),
  })),
});

interface VariantTypeFormProps {
  onSuccess: () => void;
  initialData?: VariantType;
}

export function VariantTypeForm({ onSuccess, initialData }: VariantTypeFormProps) {
  const { toast } = useToast();
  const { addVariantType, updateVariantType } = useVariantTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      valuesString: initialData?.values.map(v => v.name).join(', ') || '',
      values: initialData?.values || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert comma-separated values to array of objects
      const variantValues = values.valuesString
        .split(',')
        .map((value, index) => ({
          name: value.trim(),
          details: '',
          order: index,
        }))
        .filter(value => value.name !== '');

      if (initialData) {
        await updateVariantType(
          initialData.id,
          values.name,
          values.status,
          variantValues
        );
        toast({
          title: 'Success',
          description: 'Variant type has been updated successfully',
        });
      } else {
        await addVariantType(
          values.name,
          values.status,
          variantValues
        );
        toast({
          title: 'Success',
          description: 'Variant type has been added successfully',
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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