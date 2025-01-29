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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      return (
        <Accordion type="single" collapsible key={item.name}>
          <AccordionItem value={item.name} className="border-none">
            <AccordionTrigger
              className={cn(
                "flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-muted-foreground", // Changed from text-base to text-sm
                "hover:bg-accent hover:text-accent-foreground transition-colors",
                "hover:no-underline",
                !isOpen &&
                  "lg:justify-center lg:px-2 group-hover:justify-start group-hover:px-3"
              )}
            >
              <div
                className={cn(
                  "flex items-center",
                  isOpen ? "space-x-2" : "lg:space-x-0 group-hover:space-x-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    "transition-opacity duration-200 whitespace-nowrap",
                    !isOpen && "hidden group-hover:block"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent
              className={cn("pb-0 pt-1", !isOpen && "hidden group-hover:block")}
            >
              <div className="pl-4">
                {item.children.map((child: any) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-muted-foreground",
                      "hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === child.href &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <child.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{child.name}</span>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors",
          pathname === item.href
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground",
          !isOpen &&
            "lg:justify-center lg:px-2 group-hover:justify-start group-hover:px-3",
          "text-sm" // Changed from "text-base lg:text-sm"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span
          className={cn(
            "ml-2 whitespace-nowrap",
            !isOpen && "hidden group-hover:block" // Show text on hover when minimized
          )}
        >
          {item.name}
        </span>
      </Link>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).toggleSidebar = toggleSidebar;
    }
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block",
          "bg-background border-r",
          "transition-all duration-300 ease-in-out",
          "group", // Add group class for hover effects
          isOpen ? "w-64" : "w-20 hover:w-64" // Add hover width
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-primary" />
              <span
                className={cn(
                  "font-semibold text-lg whitespace-nowrap",  // Changed from font-bold to font-semibold
                  !isOpen && "hidden group-hover:block"
                )}
              >
                PRO Archery
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "transition-opacity",
                !isOpen && "opacity-0 group-hover:opacity-100" // Show button on hover when minimized
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <div key={item.name}>{renderNavItem(item)}</div>
            ))}
          </nav>

          <div className="border-t p-4">
            <div
              className={cn(
                "flex items-center",
                isOpen
                  ? "justify-between"
                  : "justify-center group-hover:justify-between" // Adjust on hover
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
                      !isOpen && "hidden group-hover:block" // Show on hover when minimized
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
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
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
                <span className="text-lg font-semibold">Archery Pro</span>
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
                <div key={item.name} className="text-sm"> {/* Changed from text-base */}
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
    </>
  );
}
