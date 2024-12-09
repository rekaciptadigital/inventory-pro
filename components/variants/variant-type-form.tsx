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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { generateVariantCode, validateVariantCode } from '@/lib/utils/variant-code';
import type { VariantType } from '@/types/variant';

const formSchema = z.object({
  name: z.string().min(1, 'Variant type name is required'),
  status: z.enum(['active', 'inactive']),
  valuesString: z.string().min(1, 'At least one value is required'),
  values: z.array(z.object({
    name: z.string().max(50, 'Value name cannot exceed 50 characters'),
    code: z.string()
      .min(2, 'Code must be at least 2 characters')
      .max(2, 'Code cannot exceed 2 characters')
      .refine(validateVariantCode, {
        message: 'Code must contain only uppercase letters and numbers'
      }),
    order: z.number(),
  })),
});

interface VariantTypeFormProps {
  onSuccess: () => void;
  initialData?: VariantType;
}

export function VariantTypeForm({ onSuccess, initialData }: VariantTypeFormProps) {
  const { toast } = useToast();
  const { variantTypes, addVariantType, updateVariantType } = useVariantTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valueCodePairs, setValueCodePairs] = useState<Array<{ value: string; code: string }>>(
    initialData?.values.map(v => ({ value: v.name, code: v.code })) || []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      valuesString: initialData?.values.map(v => v.name).join(', ') || '',
      values: initialData?.values || [],
    },
  });

  const generateCodes = () => {
    const valuesString = form.watch('valuesString');
    if (!valuesString) return;

    const values = valuesString.split(',').map(v => v.trim()).filter(Boolean);
    const existingCodes = variantTypes
      .flatMap(type => type.values)
      .map(value => value.code);

    const newPairs = values.map(value => ({
      value,
      code: generateVariantCode(value, existingCodes),
    }));

    setValueCodePairs(newPairs);
  };

  const updateCode = (index: number, newCode: string) => {
    const code = newCode.toUpperCase();
    if (!validateVariantCode(code) && code.length === 2) return;

    const newPairs = [...valueCodePairs];
    newPairs[index] = {
      ...newPairs[index],
      code,
    };
    setValueCodePairs(newPairs);
  };

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Check for duplicate codes
      const codes = valueCodePairs.map(p => p.code);
      if (new Set(codes).size !== codes.length) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Each variant code must be unique',
        });
        return;
      }

      // Create variant values array
      const variantValues = valueCodePairs.map((pair, index) => ({
        name: pair.value,
        code: pair.code,
        details: '',
        order: index,
      }));

      if (initialData) {
        await updateVariantType(
          initialData.id,
          formData.name,
          formData.status,
          variantValues
        );
        toast({
          title: 'Success',
          description: 'Variant type has been updated successfully',
        });
      } else {
        await addVariantType(
          formData.name,
          formData.status,
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

        <div className="space-y-2">
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

          <Button 
            type="button" 
            variant="outline" 
            onClick={generateCodes}
            className="w-full"
          >
            Generate Codes
          </Button>
        </div>

        {valueCodePairs.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valueCodePairs.map((pair, index) => (
                  <TableRow key={index}>
                    <TableCell>{pair.value}</TableCell>
                    <TableCell>
                      <Input
                        value={pair.code}
                        onChange={(e) => updateCode(index, e.target.value)}
                        className="w-24 uppercase"
                        maxLength={2}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting || valueCodePairs.length === 0}>
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