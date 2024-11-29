import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import type { Brand } from '@/types/brand';

interface BrandListProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
}

export function BrandList({ brands, onEdit }: BrandListProps) {
  if (brands.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No brands added yet. Click the "Add New Brand" button to add your first brand.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand Name</TableHead>
            <TableHead>Brand Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.code}</TableCell>
              <TableCell>{brand.description || '-'}</TableCell>
              <TableCell>{formatDate(brand.createdAt)}</TableCell>
              <TableCell>{formatDate(brand.updatedAt)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(brand)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}