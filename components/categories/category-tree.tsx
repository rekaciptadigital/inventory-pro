'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { useToast } from '@/components/ui/use-toast';
import { useCategories } from '@/lib/hooks/use-categories';
import type { Category, CategoryTreeItem } from '@/types/category';

interface CategoryTreeProps {
  categories: CategoryTreeItem[];
  onEdit: (category: Category) => void;
  onAddSubcategory: (parent: Category) => void;
}

export function CategoryTree({ categories, onEdit, onAddSubcategory }: CategoryTreeProps) {
  const { toast } = useToast();
  const { deleteCategory } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast({
        title: 'Success',
        description: 'Category has been deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete category',
      });
    }
  };

  const getBreadcrumbPath = (category: CategoryTreeItem): Category[] => {
    const path: Category[] = [category];
    let current = category;
    
    while (current.parentId) {
      const parent = categories.find(c => c.id === current.parentId);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    return path;
  };

  const renderCategory = (category: CategoryTreeItem, level: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const canAddSubcategory = level < 4; // Limit to 5 levels (0-4)

    return (
      <div key={category.id} className="border-l">
        <div className={`
          flex flex-col gap-2 p-2 hover:bg-accent/5
          ${level > 0 ? 'ml-4' : ''}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{category.name}</span>
                <Breadcrumb className="text-xs text-muted-foreground">
                  {getBreadcrumbPath(category).map((item, index, array) => (
                    <BreadcrumbItem key={item.id}>
                      <BreadcrumbLink>{item.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                  ))}
                </Breadcrumb>
              </div>
              <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                {category.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {canAddSubcategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddSubcategory(category)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Sub-Category
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
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
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this category? This will also delete all subcategories.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No categories added yet. Click the "Add New Category" button to add your first category.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      {categories.map(category => renderCategory(category))}
    </div>
  );
}