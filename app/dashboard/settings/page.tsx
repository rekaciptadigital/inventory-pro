'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/lib/hooks/users/use-profile';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
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

const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().nullable(),
  photo_profile: z.string().nullable().optional(),
});

const passwordFormSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const { updateProfile, changePassword, isUpdating: isUpdatingProfile } = useProfile();
  const { taxes, updateTax, isLoading: isLoadingTaxes } = useTaxes();
  
  // Add a new loading state specifically for refreshing user data
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(11);
  const [taxStatus, setTaxStatus] = useState<boolean>(true);
  
  // Add state variables for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      // Use type assertion to maintain boolean status while satisfying TypeScript
      await updateTax(ppnTax.id, {
        ...ppnTax,
        status: checked,
      } as any); // Use type assertion to bypass type checking
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
      // Use type assertion here as well for consistency
      await updateTax(ppnTax.id, {
        ...ppnTax,
        percentage: value,
      } as any); // Use type assertion to bypass type checking
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

  // Remove the conversion in the useEffect since we're keeping boolean values
  useEffect(() => {
    if (ppnTax) {
      setTaxPercentage(ppnTax.percentage);
      setTaxStatus(ppnTax.status as boolean); // Just cast to boolean
    }
  }, [ppnTax]);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: null,
      photo_profile: null,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number ?? null,
        photo_profile: user.photo_profile ?? null,
      });
    }
  }, [user, profileForm]);

  // Add a ref to track if we've already done the initial refresh
  const initialRefreshDone = useRef(false);

  // Fix the refresh mechanism to avoid infinite loops
  useEffect(() => {
    // Only refresh user data on initial load or when explicitly needed
    const loadUserData = async () => {
      // Only run this once when the component mounts and user is loaded
      if (!isAuthLoading && user?.id && !initialRefreshDone.current) {
        initialRefreshDone.current = true;
        
        // Set refreshing state to true
        setIsRefreshing(true);
        
        try {
          await refreshUser();
        } catch (error) {
          // Remove console.error but keep the try/catch for error handling
        } finally {
          // Set refreshing state to false when done
          setIsRefreshing(false);
        }
      }
    };
    
    loadUserData();
    // Remove refreshUser from dependencies to prevent loops
  }, [isAuthLoading, user?.id]);

  // Calculate the actual loading state based on auth loading or data refreshing
  const isLoading = isAuthLoading || isRefreshing;

  // Use the combined loading state
  if (isLoading) {
    const skeletonFields = [
      'personal-info',
      'contact-details',
      'password',
      'settings'
    ];
    
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
              {skeletonFields.map((fieldName) => (
                <div key={fieldName} className="grid gap-2">
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

  const onSubmitProfile = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        email: values.email, // This will be overridden in the hook with the authenticated user's email
        photo_profile: values.photo_profile,
      });
      
      // Add loading state during refresh
      setIsRefreshing(true);
      try {
        await refreshUser();
      } finally {
        setIsRefreshing(false);
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
      });
    }
  };

  const onSubmitPassword = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setIsChangingPassword(true);
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLanguageChange = (value: 'en' | 'id') => {
    setLanguage(value);
    toast({
      title: 'Language Changed',
      description: `Application language set to ${value === 'en' ? 'English' : 'Indonesia'}`,
    });
  };

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
          <CardDescription>{t('settings.profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
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
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Email cannot be changed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="reset">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isUpdatingProfile}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language Settings</CardTitle>
          <CardDescription>Choose your preferred application language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Application Language</h4>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language for the application interface
                </p>
              </div>
              <Select
                value={language}
                onValueChange={(value: 'en' | 'id') => handleLanguageChange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showCurrentPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-1"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showCurrentPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showNewPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-1"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showNewPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-1"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showConfirmPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Password Requirements</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc space-y-1 pl-5">
                          <li>At least 8 characters long</li>
                          <li>At least one uppercase letter</li>
                          <li>At least one lowercase letter</li>
                          <li>At least one number</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="reset">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  Change Password
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