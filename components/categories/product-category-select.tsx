import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductCategories } from '@/lib/hooks/use-product-categories';

interface ProductCategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function ProductCategorySelect({
  value,
  onValueChange,
  disabled = false,
}: ProductCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { categories, isLoading } = useProductCategories({
    search,
    status: true, // Only show active categories
  });

  // Flatten category tree for display
  const flattenCategories = (cats: any[], level = 0, path: string[] = []): any[] => {
    return cats.reduce((acc: any[], cat) => {
      const currentPath = [...path, cat.name];
      acc.push({
        ...cat,
        level,
        fullPath: currentPath.join(' > '),
      });
      if (cat.children?.length) {
        acc.push(...flattenCategories(cat.children, level + 1, currentPath));
      }
      return acc;
    }, []);
  };

  const flatCategories = flattenCategories(categories);
  const selectedCategory = flatCategories.find(cat => cat.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCategory ? (
            <span className="truncate">{selectedCategory.fullPath}</span>
          ) : (
            "Select category..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search categories..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? "Loading..." : "No categories found"}
          </CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup>
              {flatCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={() => {
                    onValueChange(category.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center",
                    category.level > 0 && `pl-${(category.level * 4) + 2}`
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{category.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}