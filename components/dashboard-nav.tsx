"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  LayoutGrid,
  Box,
  Package,
  Tags,
  Settings,
  Users,
  Building2,
} from "lucide-react";

const links = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Products",
    href: "/dashboard/inventory",
    icon: Box,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Package,
  },
  {
    title: "Price Lists",
    href: "/dashboard/price-lists",
    icon: Tags,
  },
  {
    title: "Organizations",
    href: "/dashboard/organizations",
    icon: Building2,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

const DynamicThemeToggle = dynamic(() => Promise.resolve(ThemeToggle), {
  ssr: false,
});

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow gap-y-5 overflow-y-auto border-r px-6">
        <div className="flex h-16 shrink-0 items-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "link" }),
              "font-bold text-xl"
            )}
          >
            Pro Archery
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex gap-x-3 rounded-md p-2 text-sm leading-6",
                          isActive
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        {link.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">Theme</p>
            <DynamicThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
