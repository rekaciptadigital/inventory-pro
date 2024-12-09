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
import { isValidProductTypeCode, formatProductTypeCode } from '@/lib/utils/validation/product-type';
import type { ProductType } from '@/types/product-type';

const formSchema = z.object({
  name: z.string().min(1, 'Product type name is required'),
  code: z.string()
    .min(1, 'Product type code is required')
    .refine(isValidProductTypeCode, {
      message: 'Code must contain only letters and numbers'
    }),
});

interface ProductTypeFormProps {
  onSuccess: () => void;
  initialData?: ProductType;
}

export function ProductTypeForm({ onSuccess, initialData }: ProductTypeFormProps) {
  const { toast } = useToast();
  const { productTypes, addProductType, updateProductType } = useProductTypes();
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
      
      // Check for duplicate names, excluding current product type when editing
      if (productTypes.some(type => 
        type.name.toLowerCase() === values.name.toLowerCase() &&
        type.id !== initialData?.id
      )) {
        form.setError('name', {
          type: 'manual',
          message: 'A product type with this name already exists'
        });
        return;
      }

      // Format code to uppercase
      const formattedCode = formatProductTypeCode(values.code);
      
      // Check for duplicate codes, excluding current product type when editing
      if (productTypes.some(type => 
        type.code === formattedCode &&
        type.id !== initialData?.id
      )) {
        form.setError('code', {
          type: 'manual',
          message: 'A product type with this code already exists'
        });
        return;
      }

      if (initialData) {
        await updateProductType(initialData.id, values.name, formattedCode);
        toast({
          title: 'Success',
          description: 'Product type has been updated successfully',
        });
      } else {
        await addProductType(values.name, formattedCode);
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
                Enter a unique code using letters and numbers only
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