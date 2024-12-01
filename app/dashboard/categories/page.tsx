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
import { CategoryForm } from '@/components/categories/category-form';
import { CategoryTree } from '@/components/categories/category-tree';
import { useCategories } from '@/lib/hooks/use-categories';
import type { Category } from '@/types/category';

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const { categoryTree } = useCategories();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCategory(undefined);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedCategory(undefined);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory 
                  ? 'Edit the category details below.'
                  : 'Add a new category to organize your products.'
                }
              </DialogDescription>
            </DialogHeader>
            <CategoryForm 
              onSuccess={handleSuccess}
              initialData={selectedCategory}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryTree 
        categories={categoryTree}
        onEdit={handleEdit}
      />
    </div>
  );
}