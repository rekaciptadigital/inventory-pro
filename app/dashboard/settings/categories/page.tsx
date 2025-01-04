"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPriceCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  selectCustomerCategories,
  selectEcommerceCategories,
  selectIsLoading,
} from "@/lib/store/slices/priceCategoriesSlice";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import type { PriceCategoryFormData } from "@/lib/api/price-categories";
import { deletePriceCategory } from "@/lib/api/price-categories"; // Tambahkan import ini

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const customerCategories = useSelector(selectCustomerCategories);
  const ecommerceCategories = useSelector(selectEcommerceCategories);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    // Gunakan Promise untuk menghindari warning setState during render
    Promise.resolve().then(() => {
      dispatch(fetchPriceCategories());
    });
  }, [dispatch]);

  const handleAddCategory = useCallback(
    (type: "Customer" | "Ecommerce") => {
      const newCategory = {
        id: null,
        temp_key: `new_${Date.now()}_${Math.random()}`,
        type: type.toLowerCase() as "customer" | "ecommerce",
        name: "",
        formula: "Formula: HB Naik + 0% markup",
        percentage: 0,
        status: true,
      };

      dispatch(addCategory({ type, category: newCategory }));
    },
    [dispatch]
  );

  const handleUpdateCategory = useCallback(
    (
      id: number,
      data: Partial<PriceCategoryFormData>,
      type: "Customer" | "Ecommerce"
    ) => {
      const percentage = Number(data.percentage) || 0;
      const updatedCategory = {
        id,
        temp_key: data.temp_key, // Pastikan temp_key dipertahankan
        type: type.toLowerCase() as "customer" | "ecommerce",
        name: data.name || "",
        formula: `Formula: HB Naik + ${percentage}% markup`,
        percentage: percentage,
        status: true,
      };

      dispatch(updateCategory({ type, category: updatedCategory }));
    },
    [dispatch]
  );

  const handleDeleteCategory = useCallback(
    async (
      id: number | null,
      type: "Customer" | "Ecommerce",
      temp_key?: string
    ) => {
      try {
        if (id !== null) {
          // Case 1: Hit API jika id tidak null
          await deletePriceCategory(String(id));
        }
        // Selalu delete dari state, baik untuk data dari API maupun temporary
        dispatch(deleteCategory({ type, id, temp_key }));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
    [dispatch]
  );

  return (
    <div className="container mx-auto px-4 py-4 space-y-6 max-w-7xl">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Price Categories
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your customer price categories and their multipliers
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl">
                Customer Categories
              </CardTitle>
              <CardDescription>
                Define your pricing tiers and their respective multipliers.
              </CardDescription>
            </div>
            <Button
              onClick={() => handleAddCategory("Customer")}
              variant="outline"
              size="default"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {customerCategories.map((category) => (
              <div
                key={category.temp_key}
                className="flex flex-col gap-4 p-4 border rounded-md bg-background"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) =>
                        handleUpdateCategory(
                          category.id,
                          {
                            ...category,
                            name: e.target.value,
                          },
                          "Customer"
                        )
                      }
                      placeholder="e.g., Basic, Elite"
                      disabled={isLoading}
                      className="w-full"
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
                        onChange={(e) =>
                          handleUpdateCategory(
                            category.id,
                            {
                              ...category,
                              percentage: Number(e.target.value),
                              formula: `Formula: HB Naik + ${e.target.value}% markup`, // Perbaiki format string
                            },
                            "Customer"
                          )
                        }
                        placeholder="Enter percentage"
                        disabled={isLoading}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground block">
                        Percentage (%): e.g., 10 for 10%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteCategory(
                          category.id,
                          "Customer",
                          category.temp_key
                        )
                      }
                      disabled={isLoading}
                      className="mt-1"
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
        <CardHeader className="space-y-2">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl">
                Marketplace Categories
              </CardTitle>
              <CardDescription>
                Define your marketplace pricing tiers and their respective
                multipliers.
              </CardDescription>
            </div>
            <Button
              onClick={() => handleAddCategory("Ecommerce")}
              variant="outline"
              size="default"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {ecommerceCategories.map((category) => (
              <div
                key={category.temp_key}
                className="flex flex-col gap-4 p-4 border rounded-md bg-background"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) =>
                        handleUpdateCategory(
                          category.id,
                          {
                            ...category,
                            name: e.target.value,
                          },
                          "Ecommerce"
                        )
                      }
                      placeholder="e.g., Shopee, Tokopedia"
                      disabled={isLoading}
                      className="w-full"
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
                        onChange={(e) =>
                          handleUpdateCategory(
                            category.id,
                            {
                              ...category,
                              percentage: Number(e.target.value),
                              formula: `Formula: HB Naik + ${e.target.value}% markup`, // Perbaiki format string
                            },
                            "Ecommerce"
                          )
                        }
                        placeholder="Enter percentage"
                        disabled={isLoading}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground block">
                        Percentage (%): e.g., 10 for 10%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteCategory(
                          category.id,
                          "Ecommerce",
                          category.temp_key
                        )
                      }
                      disabled={isLoading}
                      className="mt-1"
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

      <div className="flex justify-end mt-6">
        <Button disabled={isLoading} className="w-full sm:w-auto">
          Save Categories
        </Button>
      </div>
    </div>
  );
}
