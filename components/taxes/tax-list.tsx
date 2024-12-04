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
import type { Tax } from '@/types/tax';

interface TaxListProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onDelete: (id: string) => void;
}

export function TaxList({ taxes, onEdit, onDelete }: TaxListProps) {
  if (taxes.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No taxes added yet. Click the "Add New Tax" button to add your first tax rate.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tax Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes.map((tax) => (
            <TableRow key={tax.id}>
              <TableCell className="font-medium">{tax.name}</TableCell>
              <TableCell>{tax.description || '-'}</TableCell>
              <TableCell>{tax.percentage}%</TableCell>
              <TableCell>
                <Badge
                  variant={tax.status === 'active' ? 'default' : 'secondary'}
                >
                  {tax.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(tax.createdAt)}</TableCell>
              <TableCell>{formatDate(tax.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(tax)}
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
                        <AlertDialogTitle>Delete Tax</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this tax? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(tax.id)}
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