import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { useBrands } from '@/lib/hooks/use-brands';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import type { Product } from '@/types/inventory';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { getBrandName } = useBrands();
  const { getProductTypeName } = useProductTypes();

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
            <TableHead>Brand</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>HB Real</TableHead>
            <TableHead>HB Naik</TableHead>
            <TableHead>Retail Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{getBrandName(product.brand)}</TableCell>
              <TableCell>{getProductTypeName(product.productTypeId)}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.productName}</TableCell>
              <TableCell>
                <Badge variant="secondary">{product.unit}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(product.hbReal)}</TableCell>
              <TableCell>{formatCurrency(product.hbNaik)}</TableCell>
              <TableCell>{formatCurrency(product.quantities.retail)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}