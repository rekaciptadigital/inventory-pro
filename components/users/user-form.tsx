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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { isValidPhoneNumber, sanitizeFormData } from '@/lib/utils/validation';
import type { User, UserFormData } from '@/types/user';

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  phone_number: z.string()
    .nullable()
    .refine((val) => val === null || val === '' || isValidPhoneNumber(val), {
      message: 'Invalid phone number format',
    }),
  status: z.boolean(),
});

interface UserFormProps {
  onSubmit: (values: UserFormData) => Promise<void>;
  initialData?: User;
  isSubmitting?: boolean;
}

export function UserForm({ onSubmit, initialData, isSubmitting }: UserFormProps) {
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      password: '',
      phone_number: initialData?.phone_number || '',
      status: initialData?.status ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setFormError(null);
      const sanitizedData = sanitizeFormData(values);
      
      // Remove password if empty when editing
      if (initialData && !sanitizedData.password) {
        delete sanitizedData.password;
      }
      
      await onSubmit(sanitizedData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setFormError(message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter email address" 
                  {...field}
                  disabled={!!initialData} // Disable email field when editing
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{initialData ? 'New Password (optional)' : 'Password'}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={initialData ? 'Leave blank to keep current password' : 'Enter password'} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {initialData 
                  ? 'Only enter if you want to change the password'
                  : 'Must be at least 8 characters'
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter phone number (optional)" 
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
                <div className="text-sm text-muted-foreground">
                  User will {field.value ? 'be able' : 'not be able'} to access the system
                </div>
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

        {formError && (
          <div className="text-sm font-medium text-destructive">
            {formError}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? 'Updating...' : 'Creating...')
              : (initialData ? 'Update User' : 'Create User')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}