'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { usePagination } from '@/lib/hooks/use-pagination';
import { useTaxList } from '@/lib/hooks/taxes/use-tax-list';
import { useTaxMutations } from '@/lib/hooks/taxes/use-tax-mutations';
import type { Tax } from '@/types/tax';

export default function TaxesPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | undefined>();
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination();

  const { data, isLoading, error } = useTaxList({
    search,
    page: currentPage,
    limit: pageSize,
  });

  const mutations = useTaxMutations();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedTax(undefined);
  };

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading taxes. Please try again later.
      </div>
    );
  }

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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search taxes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handlePageChange(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      <TaxList 
        taxes={data?.data || []}
        onEdit={handleEdit}
        onDelete={mutations.deleteTax}
        onStatusChange={(id, status) => mutations.updateTaxStatus({ id, status })}
        isLoading={isLoading || mutations.isLoading}
      />
    </div>
  );
}