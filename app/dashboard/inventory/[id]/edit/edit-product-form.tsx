"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SingleProductForm } from "@/components/inventory/product-form/single-product-form";
import { useInventory } from "@/lib/hooks/inventory/use-inventory";
import { useToast } from "@/components/ui/use-toast";
import type { InventoryProduct } from "@/types/inventory";

export function EditProductForm() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getProduct } = useInventory();
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProduct(id as string);

        // Format categories to match expected structure
        if (data.categories) {
          data.categories = data.categories.map((cat) => ({
            product_category_id: cat.product_category_id,
            product_category_name: cat.product_category_name,
            product_category_parent: cat.product_category_parent,
            category_hierarchy: cat.category_hierarchy,
          }));
        }

        console.log("Loaded product data:", data);
        setProduct(data);
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        });
        router.push("/dashboard/inventory");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, getProduct, toast, router]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading product details...</div>;
  }

  if (!product && !isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Product not found
      </div>
    );
  }

  const handleSuccess = (updatedProduct: InventoryProduct) => {
    toast({
      title: "Success",
      description: "Product has been updated successfully",
    });
    router.push("/dashboard/inventory");
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <div className="flex-1 border rounded-lg">
        <SingleProductForm initialData={product} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
