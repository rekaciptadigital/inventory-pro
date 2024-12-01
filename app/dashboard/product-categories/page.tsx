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
import { ParentCategoryForm } from '@/components/categories/parent-category-form';
import { SubcategoryForm } from '@/components/categories/subcategory-form';
import { CategoryTree } from '@/components/categories/category-tree';
import { useCategories } from '@/lib/hooks/use-categories';
import type { Category } from '@/types/category';

export default function ProductCategoriesPage() {
  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedParent, setSelectedParent] = useState<Category | undefined>();
  const { categoryTree } = useCategories();

  const handleParentSuccess = () => {
    setIsParentDialogOpen(false);
    setSelectedCategory(undefined);
  };

  const handleSubSuccess = () => {
    setIsSubDialogOpen(false);
    setSelectedCategory(undefined);
    setSelectedParent(undefined);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    if (category.parentId) {
      setSelectedParent(categoryTree.find(c => c.id === category.parentId));
      setIsSubDialogOpen(true);
    } else {
      setIsParentDialogOpen(true);
    }
  };

  const handleAddSubcategory = (parent: Category) => {
    setSelectedParent(parent);
    setIsSubDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories and subcategories
          </p>
        </div>
        <Dialog open={isParentDialogOpen} onOpenChange={setIsParentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Parent Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Parent Category' : 'Add Parent Category'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory 
                  ? 'Edit the parent category details below.'
                  : 'Add a new top-level category to organize your products.'
                }
              </DialogDescription>
            </DialogHeader>
            <ParentCategoryForm 
              onSuccess={handleParentSuccess}
              initialData={selectedCategory}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryTree 
        categories={categoryTree}
        onEdit={handleEdit}
        onAddSubcategory={handleAddSubcategory}
      />

      {selectedParent && (
        <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory 
                  ? 'Edit the subcategory details below.'
                  : `Add a new subcategory under ${selectedParent.name}`
                }
              </DialogDescription>
            </DialogHeader>
            <SubcategoryForm 
              parentCategory={selectedParent}
              onSuccess={handleSubSuccess}
              initialData={selectedCategory}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}