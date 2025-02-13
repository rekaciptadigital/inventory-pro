import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, ChevronDown, ChevronRight, Barcode, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import type { InventoryProduct } from '@/types/inventory';
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

interface ProductRowProps {
  readonly product: InventoryProduct;
  readonly isExpanded: boolean;
  readonly isDeleting: boolean;
  readonly onToggleExpand: () => void;
  readonly onShowBarcode: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

export function ProductRow({
  product,
  isExpanded,
  isDeleting,
  onToggleExpand,
  onShowBarcode,
  onEdit,
  onDelete
}: ProductRowProps) {
  return (
    <TableRow className="group hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{product.sku}</TableCell>
      <TableCell>{product.full_product_name}</TableCell>
      <TableCell>{product.brand_name}</TableCell>
      <TableCell>{product.product_type_name}</TableCell>
      <TableCell>
        {product.categories.map((cat) => (
          <Badge key={cat.id} variant="secondary" className="mr-1">
            {cat.product_category_name}
          </Badge>
        ))}
      </TableCell>
      <TableCell>{product.unit}</TableCell>
      <TableCell>{formatDate(product.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onShowBarcode}>
            <Barcode className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialogDescription>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div><strong>SKU:</strong> {product.sku}</div>
                  <div><strong>Name:</strong> {product.full_product_name}</div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {product.product_by_variant.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
