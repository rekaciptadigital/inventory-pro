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
import { useToast } from '@/components/ui/use-toast';
import { useVariantTypes } from '@/lib/hooks/use-variant-types';
import { formatDate } from '@/lib/utils/format';
import type { VariantType } from '@/types/variant';

interface VariantTypeListProps {
  onEdit: (variantType: VariantType) => void;
}

export function VariantTypeList({ onEdit }: VariantTypeListProps) {
  const { toast } = useToast();
  const { variantTypes, deleteVariantType } = useVariantTypes();

  const handleDelete = async (id: string) => {
    try {
      await deleteVariantType(id);
      toast({
        title: 'Success',
        description: 'Variant type has been deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete variant type',
      });
    }
  };

  if (variantTypes.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No variant types added yet. Click the "Add New Variant Type" button to add your first variant type.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variantTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell>
                <Badge
                  variant={type.status === 'active' ? 'default' : 'secondary'}
                >
                  {type.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
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
                        <AlertDialogTitle>Delete Variant Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this variant type? This action cannot be undone.
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