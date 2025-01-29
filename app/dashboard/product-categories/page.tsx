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
} from '@/components/ui/dialog';
import { ProductCategoryForm } from '@/components/categories/product-category-form';
import { CategoryTree } from '@/components/categories/category-tree';
import { useProductCategories } from '@/lib/hooks/use-product-categories';

export default function ProductCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const { categories, isLoading, error, createCategory, updateCategory, deleteCategory } = useProductCategories();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCategory(undefined);
  };

  const handleEdit = async (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading categories. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories and subcategories
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedCategory(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? 'Edit category details below'
                : 'Add a new category to organize your products'
              }
            </DialogDescription>
          </DialogHeader>
          <ProductCategoryForm
            categories={categories}
            onSubmit={async (data) => {
              if (selectedCategory) {
                await updateCategory(selectedCategory.id, data);
              } else {
                await createCategory(data);
              }
              handleSuccess();
            }}
            initialData={selectedCategory}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <CategoryTree 
        categories={categories}
        onEdit={handleEdit}
        onDelete={deleteCategory}
      />
    </div>
  );
}