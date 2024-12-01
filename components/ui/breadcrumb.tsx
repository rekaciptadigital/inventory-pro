import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn('flex items-center text-sm', className)}
    {...props}
  />
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <>
    <span
      ref={ref}
      className={cn('', className)}
      {...props}
    />
    <ChevronRight className="mx-1 h-4 w-4" />
  </>
));
BreadcrumbLink.displayName = 'BreadcrumbLink';

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };