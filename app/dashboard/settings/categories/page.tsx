"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/lib/store/hooks"; // Use typed dispatch
import {
  fetchPriceCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  selectCustomerCategories,
  selectMarketplaceCategories,
  selectIsLoading,
  selectDefaultCategory,
  setDefaultCategoryAsync,
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
import { useToast } from "@/components/ui/use-toast";
import {
  batchUpdatePriceCategories,
} from "@/lib/api/price-categories";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const dispatch = useAppDispatch(); // Use typed dispatch
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const customerCategories = useSelector(selectCustomerCategories);
  const marketplaceCategories = useSelector(selectMarketplaceCategories);
  const isLoading = useSelector(selectIsLoading);
  const defaultCategory = useSelector(selectDefaultCategory);

  const handleSetDefault = async (categoryId: string) => {
    try {
      await dispatch(
        setDefaultCategoryAsync({ categoryId, setDefault: true })
      ).unwrap();

      // Refresh data setelah set default
      await dispatch(fetchPriceCategories());

      toast({
        title: "Success",
        description: "Default category has been updated",
        variant: "default", // Changed from "success" to "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          typeof error === "string" ? error : "Failed to set default category",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    dispatch(fetchPriceCategories());
  }, [dispatch]);

  const handleSaveCategories = async () => {
    setIsSaving(true);
    try {
      const allCategories = [
        ...customerCategories.map((cat) => ({
          id: typeof cat.id === "string" ? null : cat.id,
          type: "customer" as const, // Add 'as const' to specify literal type
          name: cat.name,
          formula: cat.formula,
          percentage: Number(cat.percentage),
          status: cat.status,
        })),
        ...marketplaceCategories.map((cat) => ({
          id: typeof cat.id === "string" ? null : cat.id,
          type: "marketplace" as const, // Add 'as const' to specify literal type
          name: cat.name,
          formula: cat.formula,
          percentage: Number(cat.percentage),
          status: cat.status,
        })),
      ];

      const response = await batchUpdatePriceCategories({
        data: allCategories,
      });

      if (response.status.code === 200) {
        const createdCount = response.data?.created?.length ?? 0;
        const updatedCount = response.data?.updated?.length ?? 0;

        toast({
          variant: "destructive",
          title: "Success",
          description: `Successfully saved price categories. ${createdCount} categories created and ${updatedCount} categories updated.`,
          duration: 5000,
        });

        await dispatch(fetchPriceCategories()).unwrap();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.[0] ?? "Failed to save price categories";

      toast({
        variant: "destructive",
        title: "Error Saving Categories",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
              onClick={() => dispatch(addCategory({
                type: "Customer",
                category: {
                  id: `new-${Date.now()}`,
                  name: "New Category",
                  percentage: 0,
                  formula: "Formula: HB Naik + 0% markup",
                  status: true,
                  set_default: false,
                  temp_key: `new-${Date.now()}`,
                  type: "customer", // Add missing property
                  created_at: new Date().toISOString(), // Add missing property
                  updated_at: new Date().toISOString()  // Add missing property
                }
              }))}
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
              <section
                key={category.temp_key}
                className="flex flex-col gap-4 p-4 border rounded-md bg-background relative"
                onMouseEnter={() => setHoveredCategory(category.id.toString())}
                onMouseLeave={() => setHoveredCategory(null)}
                aria-label={`Category: ${category.name}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {category.name}
                      {category.set_default && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Default)
                        </span>
                      )}
                    </div>
                    {!category.set_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(category.id.toString())}
                        className={cn(
                          // Make button accessible to keyboard users even when visually hidden
                          "transition-opacity",
                          hoveredCategory === category.id.toString() ? 
                            "opacity-100" : "opacity-0 focus:opacity-100"
                        )}
                        aria-label={`Set ${category.name} as default category`}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) =>
                        dispatch(
                          updateCategory({
                            type: "Customer",
                            category: {
                              ...category,
                              name: e.target.value,
                            },
                          })
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
                          dispatch(
                            updateCategory({
                              type: "Customer",
                              category: {
                                ...category,
                                percentage: Number(e.target.value),
                                formula: `Formula: HB Naik + ${e.target.value}% markup`,
                              },
                            })
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
                        dispatch(
                          deleteCategory({
                            type: "Customer",
                            id: typeof category.id === "string" ? null : category.id,
                            temp_key: category.temp_key,
                          })
                        )
                      }
                      disabled={isLoading}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </section>
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
              onClick={() => dispatch(addCategory({
                type: "Marketplace",
                category: {
                  id: `new-${Date.now()}`,
                  name: "New Marketplace",
                  percentage: 0,
                  formula: "Formula: Default price + 0% markup",
                  status: true,
                  set_default: false,
                  temp_key: `new-${Date.now()}`,
                  type: "marketplace", // Add missing property
                  created_at: new Date().toISOString(), // Add missing property
                  updated_at: new Date().toISOString()  // Add missing property
                }
              }))}
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
            {marketplaceCategories.map((category) => (
              <div
                key={category.temp_key}
                className="flex flex-col gap-4 p-4 border rounded-md bg-background"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={category.name}
                      onChange={(e) =>
                        dispatch(
                          updateCategory({
                            type: "Marketplace",
                            category: {
                              ...category,
                              name: e.target.value,
                            },
                          })
                        )
                      }
                      placeholder="e.g., Shopee, Tokopedia"
                      disabled={isLoading}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Formula: Default price + {category.percentage}% markup
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {defaultCategory
                        ? `Based on ${
                            customerCategories.find(
                              (c) => c.id.toString() === defaultCategory
                            )?.name ?? "Default"
                          } category price`
                        : "Please set a default customer category first"}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        type="number"
                        value={category.percentage}
                        onChange={(e) =>
                          dispatch(
                            updateCategory({
                              type: "Marketplace",
                              category: {
                                ...category,
                                percentage: Number(e.target.value),
                                formula: `Formula: Default price + ${e.target.value}% markup`,
                              },
                            })
                          )
                        }
                        placeholder="Enter percentage"
                        disabled={isLoading}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground block">
                        Additional markup (%) on top of default price
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        dispatch(
                          deleteCategory({
                            type: "Marketplace",
                            id: typeof category.id === "string" ? null : category.id,
                            temp_key: category.temp_key,
                          })
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
        <Button
          onClick={handleSaveCategories}
          disabled={isLoading || isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? "Saving..." : "Save Categories"}
        </Button>
      </div>
    </div>
  );
}
