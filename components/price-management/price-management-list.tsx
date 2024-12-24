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
import { formatCurrency } from '@/lib/utils/format';
import type { Product } from '@/types/inventory';

interface PriceManagementListProps {
  products: Product[];
  onEdit: (id: string) => void;
}

export function PriceManagementList({ products, onEdit }: PriceManagementListProps) {
  if (products.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No products found.
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
            <TableHead>Retail Price</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.productName}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{formatCurrency(product.hbNaik || 0)}</TableCell>
              <TableCell>
                {formatCurrency(product.customerPrices?.retail?.taxInclusivePrice || 0)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product.id)}
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