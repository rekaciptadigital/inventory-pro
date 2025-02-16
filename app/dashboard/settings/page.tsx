'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { useTaxes } from '@/lib/hooks/use-taxes';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().nullable(),
  language: z.enum(['en', 'id']),
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { taxes, updateTax, isLoading: isLoadingTaxes } = useTaxes();
  const [isUpdating, setIsUpdating] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(11);
  const [taxStatus, setTaxStatus] = useState<boolean>(true);
  const ppnTax = taxes.find(tax => tax.name === 'PPN') || {
    id: '1',
    name: 'PPN',
    percentage: 11,
    status: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleTaxStatusChange = useCallback(async (checked: boolean) => {
    try {
      setIsUpdating(true);
      setTaxStatus(checked);
      await updateTax(ppnTax.id, {
        ...ppnTax,
        status: checked,
      });
      toast({
        title: 'Success',
        description: 'PPN status updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update PPN status',
      });
      setTaxStatus(!checked); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  }, [ppnTax, updateTax, toast]);

  const handleTaxPercentageChange = useCallback(async (value: number) => {
    if (value === ppnTax.percentage) return;
    try {
      setIsUpdating(true);
      await updateTax(ppnTax.id, {
        ...ppnTax,
        percentage: value,
      });
      toast({
        title: 'Success',
        description: 'PPN percentage updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update PPN percentage',
      });
      setTaxPercentage(ppnTax.percentage); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  }, [ppnTax, updateTax, toast]);

  useEffect(() => {
    if (ppnTax) {
      setTaxPercentage(ppnTax.percentage);
      setTaxStatus(ppnTax.status);
    }
  }, [ppnTax]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: null,
      language: 'en',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || null,
        language,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  }, [user, language, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // TODO: Implement password update API call
      toast({
        title: 'Success',
        description: 'Your settings have been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid gap-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.title')}</CardTitle>
          <CardDescription>
            {t('settings.profile.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                        <Input {...field} disabled />
                      </FormControl>
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
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.profile.language')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value: 'en' | 'id') => {
                          field.onChange(value);
                          setLanguage(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="id">Indonesia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="reset">
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
          <CardDescription>
            Configure value-added tax (PPN) settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-medium">PPN Status</h4>
                <p className="text-sm text-muted-foreground">
                  Enable or disable PPN tax calculation
                </p>
              </div>
              <Switch
                checked={taxStatus}
                disabled={isUpdating || isLoadingTaxes}
                onCheckedChange={handleTaxStatusChange}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">PPN Percentage</h4>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxPercentage}
                  disabled={isUpdating || isLoadingTaxes || !taxStatus}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value) || value < 0 || value > 100) return;
                    setTaxPercentage(value);
                  }}
                  onBlur={() => handleTaxPercentageChange(taxPercentage)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Current PPN rate applied to all transactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}