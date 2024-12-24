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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import type { Product } from '@/types/inventory';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No products added yet. Click the "Add New Product" button to add your first product.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>
              <div className="space-y-1">
                <div>Retail Price</div>
                <div className="text-xs font-normal text-muted-foreground">(Pre-tax / With Tax)</div>
              </div>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const retailPrices = product.customerPrices?.retail || {
              basePrice: 0,
              taxInclusivePrice: 0
            };

            return (
              <TableRow key={product.id}>
                <TableCell>{product.fullProductName || product.productName}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{formatCurrency(product.usdPrice)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{formatCurrency(retailPrices.basePrice)}</div>
                    <div className="font-medium">{formatCurrency(retailPrices.taxInclusivePrice)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
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
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(product.id)}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}