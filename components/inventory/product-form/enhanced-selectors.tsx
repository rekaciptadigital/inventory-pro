import { useCallback, useState, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ClientSelect } from "@/components/ui/enhanced-select/client-select";
import { useBrands } from "@/lib/hooks/use-brands";
import { useVariants } from "@/lib/hooks/use-variants";
import type { ProductFormValues } from "./form-schema";
import {
  setBrand,
  setProductType,
  updateProductCategories,
  selectSortedCategories,
  selectAvailableCategories,
  setAvailableCategories,
} from "@/lib/store/slices/formInventoryProductSlice";
import { getProductTypes } from "@/lib/api/product-types";
import { getCategories } from "@/lib/api/categories";

interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  data?: any;
}

interface CategorySelectorState {
  level: number;
  parentId: number | null;
  selectedCategories: SelectOption[];
}

export function BrandSelector() {
  const {
    control,
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const { getBrands } = useBrands();
  const dispatch = useDispatch();
  const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);
  const initialBrandId = getValues("brand");

  // Load initial brand data
  useEffect(() => {
    const loadInitialBrand = async () => {
      if (initialBrandId) {
        console.log("Loading initial brand:", initialBrandId);
        try {
          const response = await getBrands({
            search: "",
            page: 1,
            limit: 100, // Increased limit to ensure we find the brand
          });
          const brand = response.data.find(
            (b) => b.id.toString() === initialBrandId
          );
          if (brand) {
            console.log("Found initial brand:", brand);
            setSelectedBrand({
              value: brand.id.toString(),
              label: brand.name,
              subLabel: brand.code,
              data: brand,
            });
            dispatch(
              setBrand({
                id: brand.id,
                code: brand.code,
                name: brand.name,
              })
            );
          } else {
            console.warn("Initial brand not found:", initialBrandId);
          }
        } catch (error) {
          console.error("Error loading initial brand:", error);
        }
      }
    };
    loadInitialBrand();
  }, [initialBrandId, getBrands, dispatch]);

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
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectedProductType, setSelectedProductType] =
    useState<SelectOption | null>(null);
  const initialProductTypeId = getValues("productTypeId");

  // Load initial product type data
  useEffect(() => {
    const loadInitialProductType = async () => {
      if (initialProductTypeId) {
        try {
          const response = await getProductTypes({
            search: "",
            page: 1,
            limit: 100, // Increased limit to ensure we find the product type
          });
          const productType = response.data.find(
            (pt) => pt.id.toString() === initialProductTypeId
          );
          if (productType) {
            console.log("Found initial product type:", productType);
            setSelectedProductType({
              value: productType.id.toString(),
              label: productType.name,
              subLabel: productType.code,
              data: productType,
            });
            dispatch(
              setProductType({
                id: productType.id,
                code: productType.code,
                name: productType.name,
              })
            );
          } else {
            console.warn(
              "Initial product type not found:",
              initialProductTypeId
            );
          }
        } catch (error) {
          console.error("Error loading initial product type:", error);
        }
      }
    };
    loadInitialProductType();
  }, [initialProductTypeId, dispatch]);

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
  const dispatch = useDispatch();
  const {
    control,
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();

  const storeCategories = useSelector(selectSortedCategories);
  const availableCategories = useSelector(selectAvailableCategories);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectorStates, setSelectorStates] = useState<CategorySelectorState[]>(
    []
  );

  // Helper function to find children for a category
  const findChildren = useCallback(
    (categories: any[], id: string | number): any[] => {
      for (const cat of categories) {
        if (cat.id?.toString() === id?.toString()) {
          return cat.children || [];
        }
        if (cat.children?.length) {
          const found = findChildren(cat.children, id);
          if (found.length) return found;
        }
      }
      return [];
    },
    []
  );

  // Modified initial load effect
  useEffect(() => {
    const loadCategories = async () => {
      if (isInitialized) return;

      try {
        const response = await getCategories({
          search: "",
          page: 1,
          limit: 100,
        });

        if (!response?.data) {
          throw new Error("No categories data received");
        }

        dispatch(setAvailableCategories(response.data));

        // Initialize selector states
        if (storeCategories.length > 0) {
          const states = storeCategories
            .map((category, index) => {
              if (!category?.product_category_id) return null;

              return {
                level: index,
                parentId:
                  index === 0
                    ? null
                    : parseInt(
                        storeCategories[
                          index - 1
                        ]?.product_category_id?.toString() || "0"
                      ),
                selectedCategories: [
                  {
                    value: category.product_category_id.toString(),
                    label: category.product_category_name || "",
                    data: {
                      id: category.product_category_id,
                      name: category.product_category_name,
                      parent_id: category.product_category_parent,
                      children: findChildren(
                        response.data,
                        category.product_category_id
                      ),
                    },
                  },
                ],
              };
            })
            .filter(Boolean) as CategorySelectorState[];

          setSelectorStates(
            states.length > 0
              ? states
              : [
                  {
                    level: 0,
                    parentId: null,
                    selectedCategories: [],
                  },
                ]
          );
        } else {
          setSelectorStates([
            {
              level: 0,
              parentId: null,
              selectedCategories: [],
            },
          ]);
        }

        setIsInitialLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading categories:", error);
        setSelectorStates([
          { level: 0, parentId: null, selectedCategories: [] },
        ]);
        setIsInitialLoading(false);
        setIsInitialized(true);
      }
    };

    loadCategories();
  }, [dispatch, storeCategories, isInitialized, findChildren]);

  // Modified loadCategoryOptions function
  const loadCategoryOptions = useCallback(
    async (
      search: string,
      loadedOptions: SelectOption[],
      { level, parentId }: { level: number; parentId: number | null }
    ) => {
      if (!availableCategories?.length) return { options: [], hasMore: false };

      const findChildrenForParent = (
        categories: any[],
        targetParentId: number | null
      ): any[] => {
        if (targetParentId === null) {
          return categories.filter((cat) => !cat.parent_id);
        }

        for (const cat of categories) {
          if (cat.id === targetParentId) {
            return cat.children || [];
          }
          if (cat.children?.length) {
            const found = findChildrenForParent(cat.children, targetParentId);
            if (found.length) return found;
          }
        }
        return [];
      };

      const availableOptions = findChildrenForParent(
        availableCategories,
        parentId
      )
        .filter(
          (cat) =>
            !search || cat.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((cat) => ({
          value: cat.id.toString(),
          label: cat.name,
          subLabel: cat.code,
          data: {
            ...cat,
            parent_id: parentId,
            children: cat.children || [],
          },
        }));

      return {
        options: availableOptions,
        hasMore: false,
      };
    },
    [availableCategories]
  );

  const handleChange = useCallback(
    (selected: SelectOption | null, level: number) => {
      if (!selected) {
        setSelectorStates((prev) => {
          const newStates = prev.slice(0, level + 1);
          newStates[level].selectedCategories = [];

          const remainingCategories = newStates
            .slice(0, level)
            .filter((state) => state.selectedCategories.length > 0)
            .map((state, idx) => ({
              product_category_id: parseInt(state.selectedCategories[0].value),
              product_category_name: state.selectedCategories[0].label,
              product_category_parent: state.parentId,
              category_hierarchy: idx + 1,
            }));

          setTimeout(() => {
            dispatch(updateProductCategories(remainingCategories));
            if (level === 0) {
              setValue("categoryId", "");
            }
          }, 0);

          return newStates;
        });
        return;
      }

      setSelectorStates((prev) => {
        const newStates = prev.slice(0, level + 1);
        newStates[level] = {
          ...newStates[level],
          selectedCategories: [selected],
        };

        // Add next level if there are children
        const hasChildren =
          selected.data.children && selected.data.children.length > 0;
        if (hasChildren) {
          newStates.push({
            level: level + 1,
            parentId: parseInt(selected.value),
            selectedCategories: [],
          });
        }

        // Update categories in Redux
        const selectedCategories = newStates
          .filter((state) => state.selectedCategories.length > 0)
          .map((state, idx) => ({
            product_category_id: parseInt(state.selectedCategories[0].value),
            product_category_name: state.selectedCategories[0].label,
            product_category_parent: state.parentId,
            category_hierarchy: idx + 1,
          }));

        setTimeout(() => {
          dispatch(updateProductCategories(selectedCategories));
          setValue("categoryId", selected.value);
        }, 0);

        return newStates;
      });
    },
    [dispatch, setValue]
  );

  if (isInitialLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      {selectorStates.map((state, index) => (
        <ClientSelect
          key={`category-level-${state.level}`}
          name={`category-${state.level}`}
          control={control}
          loadOptions={(search: string, loadedOptions: SelectOption[]) =>
            loadCategoryOptions(search, loadedOptions, {
              level: state.level,
              parentId: state.parentId,
            })
          }
          onChange={(selected) => handleChange(selected, state.level)}
          value={state.selectedCategories[0] || null}
          defaultOptions={true}
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

export function VariantTypeSelector({
  value,
  onChange,
  excludeIds = [],
}: {
  value: SelectOption | null;
  onChange: (selected: SelectOption | null) => void;
  excludeIds?: number[];
}) {
  const { variants, isLoading } = useVariants();

  const loadOptions = useCallback(
    async (search: string) => {
      try {
        const filteredVariants = variants
          .filter((variant) => !excludeIds.includes(variant.id))
          .filter((variant) =>
            variant.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((variant) => ({
            value: variant.id.toString(),
            label: variant.name,
            data: {
              id: variant.id,
              name: variant.name,
              values: variant.values,
            },
          }));

        return {
          options: filteredVariants,
          hasMore: false,
          additional: { page: 1 },
        };
      } catch (error) {
        console.error("Error loading variants:", error);
        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      }
    },
    [variants, excludeIds]
  );

  if (isLoading) {
    return <div>Loading variants...</div>;
  }

  return (
    <ClientSelect
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      defaultOptions
      placeholder="Select variant type..."
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

export function VariantValueSelector({
  values = [],
  value,
  onChange,
  isDisabled = false,
}: {
  values: string[];
  value: SelectOption[] | null;
  onChange: (selected: SelectOption[]) => void;
  isDisabled?: boolean;
}) {
  const [options, setOptions] = useState<SelectOption[]>([]);

  // Update options whenever values prop changes
  useEffect(() => {
    const newOptions = values.map((val) => ({
      value: val,
      label: val,
      data: val,
    }));
    setOptions(newOptions);
  }, [values]);

  const loadOptions = useCallback(
    async (search: string) => {
      const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      );

      return {
        options: filteredOptions,
        hasMore: false,
        additional: { page: 1 },
      };
    },
    [options]
  );

  const handleChange = useCallback(
    (selected: any) => {
      const selectedArray = Array.isArray(selected) ? selected : [];
      onChange(selectedArray);
    },
    [onChange]
  );

  return (
    <ClientSelect
      value={value}
      onChange={handleChange}
      loadOptions={loadOptions}
      defaultOptions={options}
      isDisabled={isDisabled}
      placeholder="Select variant values..."
      isClearable={true}
      isMulti={true}
      classNames={{
        control: () =>
          "min-h-[40px] max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent",
        placeholder: () => "text-sm",
        input: () => "text-sm",
        option: () => "text-sm",
        multiValue: () =>
          "bg-accent/50 rounded max-w-[calc(100%-8px)] my-0.5 flex-shrink-0",
        multiValueLabel: () =>
          "text-sm text-foreground px-1.5 py-0.5 truncate max-w-[160px] md:max-w-[200px]",
        multiValueRemove: () =>
          "hover:bg-accent/80 hover:text-foreground rounded-r px-1 flex items-center",
        valueContainer: () => "gap-1 p-1.5 flex flex-wrap items-center",
        container: () => "min-w-0",
      }}
      styles={{
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        multiValue: (base: any) => ({
          ...base,
          backgroundColor: "hsl(var(--accent))",
          margin: "2px",
        }),
        multiValueLabel: (base: any) => ({
          ...base,
          color: "hsl(var(--accent-foreground))",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }),
        multiValueRemove: (base: any) => ({
          ...base,
          color: "hsl(var(--accent-foreground))",
          padding: "0 4px",
          ":hover": {
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
          },
        }),
        valueContainer: (base: any) => ({
          ...base,
          padding: "2px 6px",
          gap: "2px",
          flexWrap: "wrap",
          maxHeight: "120px",
          overflowY: "auto",
        }),
        control: (base: any) => ({
          ...base,
          minHeight: "40px",
          height: "auto",
          maxHeight: "120px",
          overflow: "hidden",
        }),
        input: (base: any) => ({
          ...base,
          margin: "2px",
        }),
      }}
      menuPortalTarget={null}
      closeMenuOnSelect={false}
      key={`variant-value-${values.join(",")}`}
    />
  );
}
