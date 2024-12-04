'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaxForm } from '@/components/taxes/tax-form';
import { TaxList } from '@/components/taxes/tax-list';
import { useToast } from '@/components/ui/use-toast';
import { useTaxes } from '@/lib/hooks/use-taxes';
import type { Tax } from '@/types/tax';

export default function TaxesPage() {
  const { toast } = useToast();
  const { taxes, deleteTax } = useTaxes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | undefined>();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedTax(undefined);
  };

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTax(id);
      toast({
        title: 'Success',
        description: 'Tax has been deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete tax',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-muted-foreground">
            Manage your tax rates and configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedTax(undefined);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Tax
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTax ? 'Edit Tax' : 'Add New Tax'}
              </DialogTitle>
              <DialogDescription>
                {selectedTax 
                  ? 'Edit the tax details below.'
                  : 'Add a new tax rate to your system.'
                }
              </DialogDescription>
            </DialogHeader>
            <TaxForm 
              onSuccess={handleSuccess}
              initialData={selectedTax}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TaxList 
        taxes={taxes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}