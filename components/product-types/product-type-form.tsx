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
import { useToast } from '@/components/ui/use-toast';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import { generateTypeCode, validateTypeCode, formatTypeCode } from '@/lib/utils/type-code';
import type { ProductType } from '@/types/product-type';

const formSchema = z.object({
  name: z.string().min(1, 'Product type name is required'),
  code: z.string()
    .max(3, 'Type code must be exactly 3 characters')
    .refine(val => val === '' || validateTypeCode(val), {
      message: 'Type code must be 3 characters of letters and numbers only'
    }),
});

interface ProductTypeFormProps {
  onSuccess: () => void;
  initialData?: ProductType;
}

export function ProductTypeForm({ onSuccess, initialData }: ProductTypeFormProps) {
  const { toast } = useToast();
  const { addProductType, updateProductType } = useProductTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Get existing product types
      const savedTypes = localStorage.getItem('productTypes');
      const existingTypes = savedTypes ? JSON.parse(savedTypes) : [];
      
      // Format the code to uppercase
      let typeCode = values.code ? formatTypeCode(values.code) : '';
      
      // Check for duplicate code if provided
      if (typeCode && existingTypes.some((type: ProductType) => 
        type.code === typeCode && type.id !== initialData?.id
      )) {
        form.setError('code', {
          type: 'manual',
          message: 'This type code is already in use'
        });
        setIsSubmitting(false);
        return;
      }

      // Generate code if not provided
      if (!typeCode) {
        const existingCodes = existingTypes.map((type: ProductType) => type.code);
        typeCode = generateTypeCode(existingCodes);
      }

      if (initialData) {
        await updateProductType(initialData.id, values.name, typeCode);
        toast({
          title: 'Success',
          description: 'Product type has been updated successfully',
        });
      } else {
        await addProductType(values.name, typeCode);
        toast({
          title: 'Success',
          description: 'Product type has been added successfully',
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
              <FormLabel>Type Name</FormLabel>
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
              <FormLabel>Type Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter type code" 
                  {...field} 
                  maxLength={3}
                  className="uppercase"
                />
              </FormControl>
              <FormDescription>
                Optional. Leave empty for auto-generated code. Must be exactly 3 characters
                (letters and/or numbers).
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