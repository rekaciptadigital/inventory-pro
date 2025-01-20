import { useCallback, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  EnhancedSelect,
  type SelectOption,
} from "@/components/ui/enhanced-select";
import { ClientSelect } from "@/components/ui/enhanced-select/client-select";
import { useBrands } from "@/lib/hooks/use-brands";
import { useProductCategories } from "@/lib/hooks/use-product-categories";
import type { ProductFormValues } from "./form-schema";
import {
  setBrand,
  setProductType,
} from "@/lib/store/slices/formInventoryProductSlice";
import { getProductTypes } from "@/lib/api/product-types";
import { getCategories } from "@/lib/api/categories";

interface CategorySelectorState {
  level: number;
  parentId: number | null;
  selectedCategories: SelectOption[];
}

export function BrandSelector() {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const { getBrands } = useBrands();
  const dispatch = useDispatch();
  const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);

  const loadBrandOptions = async (
    search: string,
    loadedOptions: SelectOption[],
    { page }: { page: number }
  ) => {
    try {
      const response = await getBrands({
        search,
        page,
        limit: 10,
        sort: "created_at",
        order: "DESC",
      });

      const newOptions = response.data.map((brand) => ({
        value: brand.id.toString(),
        label: brand.name,
        subLabel: brand.code,
        data: brand,
      }));

      return {
        options: newOptions,
        hasMore: response.pagination?.hasNext || false,
        additional: {
          page: page + 1,
          hasMore: response.pagination?.hasNext || false,
        },
      };
    } catch (error) {
      console.error("Error loading brands:", error);
      return {
        options: [],
        hasMore: false,
        additional: { page: 1, hasMore: false },
      };
    }
  };

  const handleChange = useCallback(
    (selected: SelectOption | null) => {
      setSelectedBrand(selected);
      if (selected?.data) {
        setValue("brand", selected.value);
        dispatch(
          setBrand({
            id: parseInt(selected.value),
            code: selected.data.code,
            name: selected.data.name,
          })
        );
      } else {
        setValue("brand", "");
      }
    },
    [dispatch, setValue]
  );

  return (
    <ClientSelect
      name="brand"
      control={control}
      loadOptions={loadBrandOptions}
      onChange={handleChange}
      value={selectedBrand}
      defaultOptions
      placeholder="Search brands..."
      error={errors.brand?.message}
      isClearable={false}
      classNames={{
        control: () => "h-10",
        placeholder: () => "text-sm",
        input: () => "text-sm",
        option: () => "text-sm",
      }}
    />
  );
}

export function ProductTypeSelector() {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedProductType, setSelectedProductType] =
    useState<SelectOption | null>(null);

  const loadProductTypeOptions = async (
    search: string,
    loadedOptions: SelectOption[],
    { page }: { page: number }
  ) => {
    try {
      const response = await getProductTypes({
        search,
        page,
        limit: 10,
        sort: "created_at",
        order: "desc",
      });

      const newOptions = response.data.map((type) => ({
        value: type.id.toString(),
        label: type.name,
        subLabel: type.code,
        data: {
          id: type.id,
          code: type.code,
          name: type.name,
          description: type.description,
          status: type.status,
          created_at: type.created_at,
          updated_at: type.updated_at,
        },
      }));

      return {
        options: newOptions,
        hasMore: response.pagination.hasNext,
        additional: {
          page: page + 1,
          hasMore: response.pagination.hasNext,
        },
      };
    } catch (error) {
      console.error("Error loading product types:", error);
      return {
        options: [],
        hasMore: false,
        additional: { page: 1, hasMore: false },
      };
    }
  };

  const handleChange = useCallback(
    (selected: SelectOption | null) => {
      setSelectedProductType(selected);
      if (selected?.data) {
        setValue("productTypeId", selected.value);
        dispatch(
          setProductType({
            id: selected.data.id, // Use the actual id from data
            code: selected.data.code,
            name: selected.data.name,
          })
        );
      } else {
        setValue("productTypeId", "");
      }
    },
    [dispatch, setValue]
  );

  return (
    <ClientSelect
      name="productTypeId"
      control={control}
      loadOptions={loadProductTypeOptions}
      onChange={handleChange}
      value={selectedProductType}
      defaultOptions
      placeholder="Search product types..."
      error={errors.productTypeId?.message}
      isClearable={false}
      classNames={{
        control: () => "h-10",
        placeholder: () => "text-sm",
        input: () => "text-sm",
        option: () => "text-sm",
      }}
    />
  );
}

export function CategorySelector() {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const [selectorStates, setSelectorStates] = useState<CategorySelectorState[]>([
    { level: 0, parentId: null, selectedCategories: [] }
  ]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const loadCategoryOptions = async (
    search: string,
    loadedOptions: SelectOption[],
    { page }: { page: number }
  ) => {
    try {
      // Only fetch from API for root level categories if we don't have them yet
      if (page === 1) {
        const response = await getCategories({
          search,
          page,
          limit: 10,
          sort: "created_at",
          order: "DESC",
        });
        setAllCategories(response.data);

        // Filter based on parent_id for root level
        const rootCategories = response.data.filter(cat => cat.parent_id === null);
        
        return {
          options: rootCategories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
            subLabel: category.code,
            data: category, // Include full category data with children
          })),
          hasMore: false, // Since we get all data at once
          additional: {
            page: 1,
            hasMore: false,
          },
        };
      }
      return {
        options: [],
        hasMore: false,
        additional: { page, hasMore: false },
      };
    } catch (error) {
      console.error("Error loading categories:", error);
      return {
        options: [],
        hasMore: false,
        additional: { page: 1, hasMore: false },
      };
    }
  };

  const handleChange = useCallback(
    (selected: SelectOption | null, level: number) => {
      if (selected?.data) {
        setSelectorStates((prev) => {
          const newStates = prev.slice(0, level + 1);
          newStates[level] = {
            ...newStates[level],
            selectedCategories: [selected],
          };

          // Add new selector if selected category has children
          if (selected.data.children?.length > 0) {
            const childrenOptions = selected.data.children.map(child => ({
              value: child.id.toString(),
              label: child.name,
              subLabel: child.code,
              data: child,
            }));

            newStates.push({
              level: level + 1,
              parentId: parseInt(selected.value),
              selectedCategories: [],
              availableOptions: childrenOptions,
            });
          }

          return newStates;
        });

        setValue("categoryId", selected.value);
      } else {
        setSelectorStates((prev) => prev.slice(0, level + 1));
        setValue("categoryId", "");
      }
    },
    [setValue]
  );

  return (
    <div className="space-y-4">
      {selectorStates.map((state, index) => (
        <ClientSelect
          key={`category-${state.level}`}
          name={`category-${state.level}`}
          control={control}
          loadOptions={index === 0 ? loadCategoryOptions : async () => ({
            options: state.availableOptions || [],
            hasMore: false,
            additional: { page: 1, hasMore: false },
          })}
          onChange={(selected) => handleChange(selected, state.level)}
          value={state.selectedCategories[0] || null}
          defaultOptions={index === 0 ? true : state.availableOptions || []}
          placeholder={`Select ${index === 0 ? "category" : "subcategory"}...`}
          error={index === 0 ? errors.categoryId?.message : undefined}
          isClearable={false}
          classNames={{
            control: () => "h-10",
            placeholder: () => "text-sm",
            input: () => "text-sm",
            option: () => "text-sm",
          }}
        />
      ))}
    </div>
  );
}
