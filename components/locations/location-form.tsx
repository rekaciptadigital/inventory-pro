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
import { generateLocationCode } from '@/lib/utils/location-code';
import type { Location } from '@/types/location';

// Define schema type before the component
type LocationFormSchema = z.infer<ReturnType<typeof createLocationFormSchema>>;

// Create a schema factory function
const createLocationFormSchema = (isAutoGenerateCode: boolean) => {
  return z.object({
    code: z.string().optional(),
    name: z.string().min(1, 'Location name is required'),
    type: z.enum(['warehouse', 'store', 'affiliate', 'others']),
    description: z.string().optional(),
  }).refine((data) => {
    if (!data.code && !isAutoGenerateCode) {
      return false;
    }
    return true;
  }, {
    message: "Location code is required",
    path: ["code"]
  });
};

interface LocationFormProps {
  readonly onSubmit: (data: LocationFormSchema) => Promise<void>;
  readonly initialData?: Location;
  readonly onClose: () => void;
}

export function LocationForm({ onSubmit, initialData, onClose }: LocationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoGenerateCode, setIsAutoGenerateCode] = useState(!initialData);

  const formSchema = createLocationFormSchema(isAutoGenerateCode);

  const form = useForm<LocationFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code ?? '',
      name: initialData?.name ?? '',
      type: initialData?.type ?? 'warehouse',
      description: initialData?.description ?? '',
    },
  });

  const handleSubmit = async (values: LocationFormSchema) => {
    try {
      setIsSubmitting(true);
      const submissionData = { ...values };
      
      if (isAutoGenerateCode && !initialData) {
        submissionData.code = generateLocationCode(values.type);
      }
      
      await onSubmit(submissionData);
      form.reset();
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

  const getSubmitButtonLabel = () => {
    if (isSubmitting) {
      return initialData ? 'Updating...' : 'Creating...';
    }
    return initialData ? 'Update Location' : 'Create Location';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isAutoGenerateCode && !initialData}
                  placeholder={isAutoGenerateCode ? 'Auto-generated on save' : 'Enter location code'}
                />
              </FormControl>
              {!initialData && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoGenerate"
                    checked={isAutoGenerateCode}
                    onChange={(e) => setIsAutoGenerateCode(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="autoGenerate" className="text-sm text-muted-foreground">
                    Auto-generate code
                  </label>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="affiliate">Affiliate Store</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Enter location description (optional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional details about the location
              </FormDescription>
              <FormMessage />
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
            {getSubmitButtonLabel()}
          </Button>
        </div>
      </form>
    </Form>
  );
}