'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { usePriceCategories } from '@/lib/hooks/price-categories/use-price-categories';
import type { PriceCategoryFormData } from '@/lib/api/price-categories';

export default function CategoriesPage() {
  const { toast } = useToast();
  const { 
    customerCategories, 
    ecommerceCategories, 
    createPriceCategory,
    updatePriceCategory,
    deletePriceCategory,
    isLoading 
  } = usePriceCategories();

  const handleAddCategory = async (type: 'Customer' | 'Ecommerce') => {
    try {
      const newCategory: PriceCategoryFormData = {
        type,
        name: '',
        formula: `Formula: HB Naik + 0% markup`,
        percentage: 0,
        status: true,
      };
      await createPriceCategory(newCategory);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, data: PriceCategoryFormData) => {
    try {
      await updatePriceCategory(id, data);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deletePriceCategory(id);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Price Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your customer price categories and their multipliers
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-xl">Customer Categories</CardTitle>
              <CardDescription>
                Define your pricing tiers and their respective multipliers.
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleAddCategory('Customer')} 
              variant="outline" 
              size="default"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {customerCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 p-4 border rounded-md bg-background"
              >
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) => handleUpdateCategory(category.id, {
                        ...category,
                        name: e.target.value,
                      })}
                      placeholder="e.g., Basic, Elite"
                      disabled={isLoading}
                    />
                    <div className="text-xs text-muted-foreground">
                      {category.formula}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        type="number"
                        value={category.percentage}
                        onChange={(e) => handleUpdateCategory(category.id, {
                          ...category,
                          percentage: Number(e.target.value),
                          formula: `Formula: HB Naik + ${e.target.value}% markup`,
                        })}
                        placeholder="Enter percentage"
                        disabled={isLoading}
                      />
                      <span className="text-xs text-muted-foreground block">
                        Percentage (%): e.g., 10 for 10%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-xl">Marketplace Categories</CardTitle>
              <CardDescription>
                Define your marketplace pricing tiers and their respective multipliers.
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleAddCategory('Ecommerce')} 
              variant="outline" 
              size="default"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {ecommerceCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 p-4 border rounded-md bg-background"
              >
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) => handleUpdateCategory(category.id, {
                        ...category,
                        name: e.target.value,
                      })}
                      placeholder="e.g., Shopee, Tokopedia"
                      disabled={isLoading}
                    />
                    <div className="text-xs text-muted-foreground">
                      {category.formula}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        type="number"
                        value={category.percentage}
                        onChange={(e) => handleUpdateCategory(category.id, {
                          ...category,
                          percentage: Number(e.target.value),
                          formula: `Formula: HB Naik + ${e.target.value}% markup`,
                        })}
                        placeholder="Enter percentage"
                        disabled={isLoading}
                      />
                      <span className="text-xs text-muted-foreground block">
                        Percentage (%): e.g., 10 for 10%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}