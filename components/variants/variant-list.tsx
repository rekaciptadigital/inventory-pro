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
import { Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import type { Variant } from '@/types/variant';

interface VariantListProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function VariantList({ variants, onEdit, onDelete, isLoading }: VariantListProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        Loading variants...
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No variants found. Add your first variant by clicking the "Add New Variant" button.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Values</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell className="font-medium">{variant.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {variant.values.map((value, index) => (
                    <Badge key={index} variant="secondary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{variant.display_order}</TableCell>
              <TableCell>{formatDate(variant.created_at)}</TableCell>
              <TableCell>
                <Badge variant={variant.status ? 'default' : 'secondary'}>
                  {variant.status ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(variant)}
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
                        <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this variant? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(variant.id.toString())}
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