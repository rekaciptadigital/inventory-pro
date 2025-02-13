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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { generateLocationCode } from '@/lib/utils/location-code';
import type { Location } from '@/types/location';

const formSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Location name is required'),
  type: z.enum(['warehouse', 'store', 'affiliate', 'others'] as const),
  description: z.string().optional(),
  status: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  readonly onSubmit: (data: FormValues) => Promise<void>;
  readonly initialData?: Location;
  readonly onClose: () => void;
}

export function LocationForm({ onSubmit, initialData, onClose }: LocationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoGenerateCode, setIsAutoGenerateCode] = useState(!initialData);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code ?? '',
      name: initialData?.name ?? '',
      type: initialData?.type ?? 'warehouse',
      description: initialData?.description ?? '',
      status: initialData?.status ?? true,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const submissionData = { ...values };
      
      if (isAutoGenerateCode && !initialData) {
        submissionData.code = generateLocationCode(values.type);
      }

      if (!submissionData.code) {
        throw new Error('Location code is required');
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Location will {field.value ? 'be visible' : 'not be visible'} in the system
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