'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
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
import { generateProductTypeCode, validateProductTypeCode, formatProductTypeCode } from '@/lib/utils/product-type-code';
import type { ProductType, ProductTypeFormData } from '@/types/product-type';
import axiosInstance from '@/lib/api/axios';

const formSchema = z.object({
  name: z.string().min(1, 'Product type name is required'),
  code: z.string()
    .refine(
      (val) => val === '' || validateProductTypeCode(val),
      'Code must be 2 alphanumeric characters'
    ),
  description: z.string().optional(),
  status: z.boolean().default(true),
});

interface ProductTypeFormProps {
  onSubmit: (data: ProductTypeFormData) => Promise<void>;
  initialData?: ProductType;
  isSubmitting?: boolean;
  existingCodes?: string[];
}

export function ProductTypeForm({ 
  onSubmit, 
  initialData, 
  isSubmitting,
  existingCodes = []
}: Readonly<ProductTypeFormProps>) {
  const { toast } = useToast();
  const form = useForm<ProductTypeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      code: initialData?.code ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? true,
    },
  });

  // Helper function to check if code exists in the API
  const checkCodeExists = async (code: string): Promise<boolean> => {
    try {
      // Use the search parameter to find if code exists
      const params = new URLSearchParams({
        search: code
      });
      const response = await axiosInstance.get(`/product-types?${params.toString()}`);
      
      if (response.data?.data) {
        // Check if any returned product type has the exact code
        return response.data.data.some((item: any) => item.code === code);
      }
      return false;
    } catch (error) {
      console.error('Error checking code existence:', error);
      return false; // Assume it doesn't exist on error
    }
  };

  // Generate a unique code with retry mechanism
  const generateUniqueCode = async (existingCodesList: string[]): Promise<string | null> => {
    let code: string;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    let isCodeTaken = false;
    
    do {
      code = generateProductTypeCode([...existingCodesList]);
      console.log(`Attempt ${attempts+1}: Generated code: ${code}`);
      
      isCodeTaken = await checkCodeExists(code);
      
      if (isCodeTaken) {
        console.log(`Code ${code} already exists, adding to existingCodes`);
        existingCodesList.push(code);
      }
      
      attempts++;
    } while (isCodeTaken && attempts < MAX_ATTEMPTS);
    
    if (attempts >= MAX_ATTEMPTS) {
      toast({
        variant: "destructive",
        title: "Error Generating Code",
        description: "Failed to generate a unique code after multiple attempts"
      });
      return null;
    }
    
    return code;
  };
  
  // Validate user-provided code
  const validateUserCode = async (code: string): Promise<string | null> => {
    const formattedCode = formatProductTypeCode(code);
    
    // Skip validation if we're editing and the code hasn't changed
    if (formattedCode === initialData?.code) {
      return formattedCode;
    }
    
    const isCodeTaken = await checkCodeExists(formattedCode);
    if (isCodeTaken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This code is already in use"
      });
      return null;
    }
    
    return formattedCode;
  };
  
  // Handle API errors
  const handleApiError = (error: unknown) => {
    console.error('Error submitting form:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Failed to save product type";
      
      toast({
        variant: "destructive",
        title: error.response?.status === 409 ? "Duplicate Code" : "Error",
        description: errorMessage
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product type"
      });
    }
  };

  // Main submit handler with reduced complexity
  const handleSubmit = async (values: ProductTypeFormData) => {
    try {
      let finalCode: string | null;
      
      // Process code based on whether user provided one or not
      if (!values.code) {
        finalCode = await generateUniqueCode(existingCodes);
      } else {
        finalCode = await validateUserCode(values.code);
      }
      
      // If we couldn't get a valid code, abort submission
      if (!finalCode) {
        return;
      }

      // Submit with validated/generated code
      await onSubmit({
        ...values,
        code: finalCode,
      });
      
    } catch (error) {
      handleApiError(error);
    }
  };

  // Helper function to get button text
  const getButtonText = () => {
    if (isSubmitting) {
      return initialData ? 'Updating...' : 'Creating...';
    }
    return initialData ? 'Update Type' : 'Create Type';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                  placeholder="Leave empty for auto-generation" 
                  {...field}
                  className="uppercase"
                  maxLength={2}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                2 characters code - will be auto-generated if left empty
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
            {getButtonText()}
          </Button>
        </div>
      </form>
    </Form>
  );
}