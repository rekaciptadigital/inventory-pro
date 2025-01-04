import { useState, useEffect } from "react";
import {
  getPriceCategories,
  createPriceCategory,
  updatePriceCategory,
  deletePriceCategory,
  type PriceCategory,
  type PriceCategoryFormData,
} from "@/lib/api/price-categories";

export function usePriceCategories() {
  const [customerCategories, setCustomerCategories] = useState<PriceCategory[]>(
    []
  );
  const [ecommerceCategories, setEcommerceCategories] = useState<
    PriceCategory[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await getPriceCategories();
      const groupedData = response.data;

      // Process grouped data
      groupedData.forEach((group) => {
        if (group.type.toLowerCase() === "customer") {
          setCustomerCategories(group.categories);
        } else if (group.type.toLowerCase() === "eccomerce") {
          setEcommerceCategories(group.categories);
        }
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (data: PriceCategoryFormData) => {
    setIsLoading(true);
    try {
      // Buat objek kategori baru
      const newCategory: PriceCategory = {
        id: Date.now(), // temporary ID
        name: "",
        formula: `Formula: HB Naik + 0% markup`,
        percentage: "0",
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Langsung tambahkan ke state yang sesuai
      if (data.type.toLowerCase() === "customer") {
        setCustomerCategories((prev) => [...prev, newCategory]);
      } else if (data.type.toLowerCase() === "ecommerce") {
        setEcommerceCategories((prev) => [...prev, newCategory]);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (
    id: string | number,
    data: PriceCategoryFormData
  ) => {
    setIsLoading(true);
    try {
      const updatedCategory: PriceCategory = {
        id: Number(id),
        name: data.name || "",
        formula: data.formula || "",
        percentage: String(data.percentage || 0),
        status: data.status ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Pastikan type ada sebelum melakukan pengecekan
      if (data.type?.toLowerCase() === "customer") {
        setCustomerCategories((prev) =>
          prev.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
      } else if (data.type?.toLowerCase() === "ecommerce") {
        setEcommerceCategories((prev) =>
          prev.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
      }
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsLoading(true);
    try {
      await deletePriceCategory(id);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customerCategories,
    ecommerceCategories,
    isLoading,
    createPriceCategory: handleCreateCategory,
    updatePriceCategory: handleUpdateCategory,
    deletePriceCategory: handleDeleteCategory,
  };
}
