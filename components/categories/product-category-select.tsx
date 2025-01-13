import { useState } from 'react';
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
  parentId?: string | null;
}

export function ProductCategorySelect({
  value,
  onValueChange,
  disabled = false,
  parentId,
}: ProductCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { categories, isLoading } = useProductCategories();

  // Flatten nested categories
  const flattenCategories = (categories: any[]): any[] => {
    let result: any[] = [];
    categories.forEach(category => {
      const flatCategory = { ...category };
      if (category.children) {
        result = [...result, ...flattenCategories(category.children)];
      }
      result.push(flatCategory);
    });
    return result;
  };

  // Filter categories based on parentId and search term
  const filteredCategories = flattenCategories(categories)
    .filter(category => {
      const matchesParent = parentId === null 
        ? !category.parent_id 
        : category.parent_id?.toString() === parentId?.toString();
      
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase());
      
      return matchesParent && matchesSearch;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Find the selected category
  const selectedCategory = flattenCategories(categories)
    .find(cat => cat.id.toString() === value);

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
            <span className="truncate">{selectedCategory.name}</span>
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
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id.toString()}
                  onSelect={() => {
                    onValueChange(category.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id.toString() ? "opacity-100" : "opacity-0"
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