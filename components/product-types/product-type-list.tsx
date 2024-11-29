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
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useProductTypes } from '@/lib/hooks/use-product-types';
import { formatDate } from '@/lib/utils/format';
import type { ProductType } from '@/types/product-type';

interface ProductTypeListProps {
  onEdit: (productType: ProductType) => void;
}

export function ProductTypeList({ onEdit }: ProductTypeListProps) {
  const { toast } = useToast();
  const { productTypes, deleteProductType } = useProductTypes();

  const handleDelete = async (id: string) => {
    try {
      await deleteProductType(id);
      toast({
        title: 'Success',
        description: 'Product type has been deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product type',
      });
    }
  };

  if (productTypes.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No product types added yet. Click the "Add New Type" button to add your first product type.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type Name</TableHead>
            <TableHead>Type Code</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>{type.code}</TableCell>
              <TableCell>{formatDate(type.createdAt)}</TableCell>
              <TableCell>{formatDate(type.updatedAt)}</TableCell>
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
                          onClick={() => handleDelete(type.id)}
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