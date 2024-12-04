'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductDropdownProps {
  onSingleProduct: () => void;
  onProductVariant: () => void;
}

export function ProductDropdown({ onSingleProduct, onProductVariant }: ProductDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSingleProduct}>
          Single Product
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onProductVariant}>
          Product with Variants
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}