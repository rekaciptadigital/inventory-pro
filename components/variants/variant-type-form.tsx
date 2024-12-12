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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import type { VariantType } from '@/types/variant';

const formSchema = z.object({
  name: z.string().min(1, 'Variant type name is required'),
  status: z.enum(['active', 'inactive']),
  valuesString: z.string().min(1, 'At least one value is required'),
});

interface VariantTypeFormProps {
  onSuccess: () => void;
  initialData?: VariantType;
}

export function VariantTypeForm({ onSuccess, initialData }: VariantTypeFormProps) {
  const { toast } = useToast();
  const { variantTypes, addVariantType, updateVariantType } = useVariantTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      valuesString: initialData?.values.map(v => v.name).join(', ') || '',
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Check for duplicate names
      if (variantTypes.some(type => 
        type.name.toLowerCase() === formData.name.toLowerCase() &&
        type.id !== initialData?.id
      )) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'A variant type with this name already exists',
        });
        return;
      }

      // Create variant values array
      const values = formData.valuesString
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)
        .map((name, index) => ({
          name,
          details: '',
          order: index,
        }));

      if (initialData) {
        await updateVariantType(
          initialData.id,
          formData.name,
          formData.status,
          values
        );
        toast({
          title: 'Success',
          description: 'Variant type has been updated successfully',
        });
      } else {
        await addVariantType(
          formData.name,
          formData.status,
          values
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

        <FormField
          control={form.control}
          name="valuesString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Values</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter values separated by commas (e.g., Red, Blue, Black)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter each value separated by a comma. Maximum 50 characters per value.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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