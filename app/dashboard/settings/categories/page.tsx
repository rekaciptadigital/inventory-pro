'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import type { PriceCategory } from '@/types/settings';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  multiplier: z.number().min(0.01, 'Multiplier must be greater than 0'),
});

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<PriceCategory[]>([]);

  useEffect(() => {
    const savedCategories = localStorage.getItem('priceCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Set default categories if none exist
      const defaultCategories = [
        { id: '1', name: 'Elite', percentage: 10, order: 0 },
        { id: '2', name: 'Super', percentage: 20, order: 1 },
        { id: '3', name: 'Basic', percentage: 30, order: 2 },
      ];
      setCategories(defaultCategories);
      localStorage.setItem('priceCategories', JSON.stringify(defaultCategories));
    }
  }, []);

  const addCategory = () => {
    const newCategory: PriceCategory = {
      id: Date.now().toString(),
      name: '',
      percentage: 0,
      order: categories.length,
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (id: string) => {
    if (categories.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must have at least one category',
      });
      return;
    }
    setCategories(categories.filter(cat => cat.id !== id));
    localStorage.setItem('priceCategories', JSON.stringify(
      categories.filter(cat => cat.id !== id)
    ));
  };

  const updateCategory = (id: string, field: keyof PriceCategory, value: string | number) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === id) {
        return { ...cat, [field]: value };
      }
      return cat;
    });
    setCategories(updatedCategories);
    localStorage.setItem('priceCategories', JSON.stringify(updatedCategories));
  };

  const moveCategory = (fromIndex: number, toIndex: number) => {
    const newCategories = [...categories];
    const [movedItem] = newCategories.splice(fromIndex, 1);
    newCategories.splice(toIndex, 0, movedItem);
    newCategories.forEach((cat, index) => {
      cat.order = index;
    });
    setCategories(newCategories);
  };

  const saveCategories = () => {
    // Here you would typically save to your backend
    localStorage.setItem('priceCategories', JSON.stringify(categories));
    toast({
      title: 'Success',
      description: 'Categories have been saved successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Price Categories</h1>
        <p className="text-muted-foreground">
          Manage your customer price categories and their multipliers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Categories</CardTitle>
          <CardDescription>
            Define your pricing tiers and their respective multipliers. Categories will be applied in the order shown below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center space-x-4 p-4 border rounded-lg bg-card"
              >
                <div className="cursor-move">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Name</label>
                    <Input
                      value={category.name}
                      onChange={(e) => {
                        updateCategory(category.id, 'name', e.target.value);
                      }}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Percentage (%)</label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={category.percentage}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        updateCategory(category.id, 'percentage', parseInt(value) || 0);
                      }}
                      placeholder="Enter percentage"
                    />
                    <p className="text-xs text-muted-foreground">Enter percentage value (e.g. 10 for 10%)</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCategory(category.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button onClick={addCategory} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="mt-6 bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Price Calculation Formula</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center space-x-2">
                  <span>•</span>
                  <span>{category.name}: HB Naik + {category.percentage}% markup</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveCategories}>Save Categories</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}