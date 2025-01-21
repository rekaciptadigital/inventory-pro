'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import type { ProductType } from '@/types/product-type';

interface ProductTypeListProps {
  productTypes: ProductType[];
  onEdit: (productType: ProductType) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function ProductTypeList({
  productTypes,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading,
}: ProductTypeListProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        Loading product types...
      </div>
    );
  }

  if (productTypes.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No product types found. Add your first product type by clicking the "Add New Type" button.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>{type.code}</TableCell>
              <TableCell>{type.description || '-'}</TableCell>
              <TableCell>{formatDate(type.created_at)}</TableCell>
              <TableCell>{formatDate(type.updated_at)}</TableCell>
              <TableCell>
                <Switch
                  checked={type.status}
                  onCheckedChange={(checked) => onStatusChange(type.id, checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this product type? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(type.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}