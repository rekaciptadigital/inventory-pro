"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Box,
  BoxSelect,
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
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Target },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  {
    name: "Products",
    icon: Box,
    children: [
      { name: "Inventory", href: "/dashboard/inventory", icon: Box },
      {
        name: "Price Management",
        href: "/dashboard/price-management",
        icon: DollarSign,
      },
      {
        name: "Product Stock",
        href: "/dashboard/products/stock",
        icon: Package,
      },
    ],
  },
  {
    name: "Product Attributes",
    icon: BoxSelect,
    children: [
      { name: "Brands", href: "/dashboard/brands", icon: BookOpen },
      { name: "Variants", href: "/dashboard/variants", icon: Layers },
      { name: "Product Types", href: "/dashboard/product-types", icon: ListTree },
      { name: "Product Categories", href: "/dashboard/product-categories", icon: FolderTree },
    ],
  },
  {
    name: "Price Categories",
    href: "/dashboard/settings/categories",
    icon: Tags,
  },
  { name: "Taxes", href: "/dashboard/taxes", icon: DollarSign },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderNavItem = (item: any, depth = 0) => {
    const Icon = item.icon;

    if (item.children) {
      return isOpen ? (
        // Expanded state - use Accordion
        <Accordion type="single" collapsible key={item.name}>
          <AccordionItem value={item.name} className="border-none">
            <AccordionTrigger
              className={cn(
                "flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-muted-foreground",
                "hover:bg-secondary hover:text-primary transition-all",
                "hover:no-underline"
              )}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="transition-opacity duration-200">
                  {item.name}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pt-1">
              <div className="pl-4 space-y-1">
                {item.children.map((child: any) => (
                  <div key={child.name}>
                    {renderNavItem(child, depth + 1)}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        // Minimized state - use Popover with Tooltip
        <div className="relative">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center justify-center p-2 rounded-lg",
                        "hover:bg-accent hover:text-accent-foreground transition-colors",
                        "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    className="w-56 p-2 ml-2"
                    sideOffset={-5}
                  >
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-sm">{item.name}</div>
                      {item.children.map((child: any) => (
                        <Link
                          key={child.href || child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center space-x-2 px-2 py-1.5 rounded-lg text-sm",
                            "hover:bg-secondary hover:text-primary transition-colors",
                            pathname === child.href && "bg-accent text-accent-foreground"
                          )}
                        >
                          <child.icon className="h-4 w-4 flex-shrink-0" />
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="animate-in fade-in-50 duration-200"
            >
              {item.name}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    // Regular menu item with Tooltip when minimized
    return isOpen ? (
      <Link
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 rounded-lg transition-all",
          "hover:bg-secondary hover:text-primary",
          pathname === item.href
            ? "bg-secondary text-primary"
            : "text-muted-foreground",
          "text-sm"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="ml-2">{item.name}</span>
      </Link>
    ) : (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-all",
              "hover:bg-secondary hover:text-primary",
              pathname === item.href
                ? "bg-secondary text-primary"
                : "text-muted-foreground",
              "text-sm"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent 
          side="right"
          className="animate-in fade-in-50 duration-200"
        >
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).toggleSidebar = toggleSidebar;
    }
  }, []);

  return (
    <TooltipProvider>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block",
          "bg-background border-r",
          "transition-all duration-300 ease-in-out",
          "group",
          isOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-primary" />
              <span
                className={cn(
                  "text-lg font-semibold whitespace-nowrap",
                  !isOpen && "hidden"
                )}
              >
                PRO Archery
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="transition-opacity hover:opacity-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <div key={item.href || item.name} className="text-sm">
                {renderNavItem(item)}
              </div>
            ))}
          </nav>

          <div className="border-t p-4">
            <div
              className={cn(
                "flex items-center",
                isOpen
                  ? "justify-between"
                  : "justify-center"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      !isOpen && "hidden"
                    )}
                  >
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
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {isOpen && (
          <button
            type="button"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsOpen(false)
              }
            }}
            aria-label="Close navigation menu"
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50",
            "w-72 bg-background border-r",
            "transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold tracking-tight">Archery Pro</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-4">
              {navigation.map((item) => (
                <div key={item.href || item.name} className="text-sm">
                  {renderNavItem(item)}
                </div>
              ))}
            </nav>

            <div className="border-t">
              <div className="flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
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
        </aside>
      </div>
    </TooltipProvider>
  );
}