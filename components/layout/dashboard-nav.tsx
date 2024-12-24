'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  BarChart3,
  Box,
  LogOut,
  Moon,
  Settings,
  Sun,
  Target,
  User,
  Tags,
  DollarSign,
  BookOpen,
  ListTree,
  Layers,
  Menu,
  FolderTree,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoutButton } from '@/components/auth/logout-button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Target },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Box },
  { name: 'Price Management', href: '/dashboard/price-management', icon: DollarSign },
  { name: 'Brands', href: '/dashboard/brands', icon: BookOpen },
  { name: 'Product Types', href: '/dashboard/product-types', icon: ListTree },
  { name: 'Product Categories', href: '/dashboard/product-categories', icon: FolderTree },
  { name: 'Price Categories', href: '/dashboard/settings/categories', icon: Tags },
  { name: 'Variants', href: '/dashboard/variants', icon: Layers },
  { name: 'Taxes', href: '/dashboard/taxes', icon: DollarSign },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      'flex-shrink-0 transition-all duration-200',
      isOpen ? 'w-64' : 'w-20',
      'lg:w-64'
    )}>
      <div className="flex h-screen flex-col bg-muted/40 border-r">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <span className={cn(
              'font-bold transition-opacity duration-200',
              isOpen ? 'opacity-100' : 'opacity-0 hidden',
              'lg:opacity-100 lg:inline'
            )}>
              Archery Pro
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors',
                    pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    'transition-opacity duration-200',
                    isOpen ? 'opacity-100' : 'opacity-0 hidden',
                    'lg:opacity-100 lg:inline'
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}