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
import { useVariants } from "@/lib/hooks/use-variants";
import type { ProductFormValues } from "./form-schema";
import {
  setBrand,
  setProductType,
  addCategory,
  removeCategory,
  updateProductCategories,
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
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const { getBrands } = useBrands();
  const dispatch = useDispatch();
  const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);
  const initialBrandId = getValues('brand');

  // Load initial brand data
  useEffect(() => {
    const loadInitialBrand = async () => {
      if (initialBrandId) {
        console.log('Loading initial brand:', initialBrandId);
        try {
          const response = await getBrands({
            search: '',
            page: 1,
            limit: 100 // Increased limit to ensure we find the brand
          });
          const brand = response.data.find(b => b.id.toString() === initialBrandId);
          if (brand) {
            console.log('Found initial brand:', brand);
            setSelectedBrand({
              value: brand.id.toString(),
              label: brand.name,
              subLabel: brand.code,
              data: brand
            });
            dispatch(setBrand({
              id: brand.id,
              code: brand.code,
              name: brand.name,
            }));
          } else {
            console.warn('Initial brand not found:', initialBrandId);
          }
        } catch (error) {
          console.error('Error loading initial brand:', error);
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
  const initialProductTypeId = getValues('productTypeId');

  // Load initial product type data
  useEffect(() => {
    const loadInitialProductType = async () => {
      if (initialProductTypeId) {
        try {
          const response = await getProductTypes({
            search: '',
            page: 1,
            limit: 100 // Increased limit to ensure we find the product type
          });
          const productType = response.data.find(pt => pt.id.toString() === initialProductTypeId);
          if (productType) {
            console.log('Found initial product type:', productType);
            setSelectedProductType({
              value: productType.id.toString(),
              label: productType.name,
              subLabel: productType.code,
              data: productType
            });
            dispatch(setProductType({
              id: productType.id,
              code: productType.code,
              name: productType.name,
            }));
          } else {
            console.warn('Initial product type not found:', initialProductTypeId);
          }
        } catch (error) {
          console.error('Error loading initial product type:', error);
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
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<ProductFormValues>();
  const dispatch = useDispatch();
  const [selectorStates, setSelectorStates] = useState<CategorySelectorState[]>(
    [{ level: 0, parentId: null, selectedCategories: [] }]
  );
  const [pendingSelection, setPendingSelection] = useState<{
    selected: SelectOption | null;
    level: number;
  } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);

  const loadCategoryOptions = useCallback(
    async (
      search: string,
      loadedOptions: SelectOption[],
      { page }: { page: number }
    ) => {
      try {
        // Only fetch from API for root level categories
        const response = await getCategories({
          search,
          page,
          limit: 10,
          sort: "created_at",
          order: "DESC",
        });

        // Filter based on parent_id for root level
        const rootCategories = response.data.filter(
          (cat) => cat.parent_id === null
        );

        return {
          options: rootCategories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
            subLabel: category.code,
            data: category, // Include full category data with children
          })),
          hasMore: response.pagination.hasNext,
          additional: {
            page: page + 1,
            hasMore: response.pagination.hasNext,
          },
        };
      } catch (error) {
        console.error("Error loading categories:", error);
        return {
          options: [],
          hasMore: false,
          additional: { page: 1, hasMore: false },
        };
      }
    },
    []
  );

  // Add state for initial category
  const initialCategoryId = useFormContext<ProductFormValues>().getValues('categoryId');

  // Load initial category data
  useEffect(() => {
    const loadInitialCategory = async () => {
      if (initialCategoryId) {
        try {
          const response = await getCategories({
            search: '',
            page: 1,
            limit: 100 // Increased limit to ensure we find the category
          });

          const findCategoryPath = (categories: any[], targetId: string): any[] => {
            for (const category of categories) {
              if (category.id.toString() === targetId) {
                return [category];
              }
              if (category.children) {
                const path = findCategoryPath(category.children, targetId);
                if (path.length) {
                  return [category, ...path];
                }
              }
            }
            return [];
          };

          const categoryPath = findCategoryPath(response.data, initialCategoryId);

          if (categoryPath.length) {
            const newStates = categoryPath.map((category, index) => ({
              level: index,
              parentId: index === 0 ? null : categoryPath[index - 1].id,
              selectedCategories: [{
                value: category.id.toString(),
                label: category.name,
                subLabel: category.code,
                data: category
              }]
            }));

            setSelectorStates(newStates);

            const selectedCats = categoryPath.map((category, index) => ({
              product_category_id: category.id,
              product_category_parent: index === 0 ? null : categoryPath[index - 1].id,
              product_category_name: category.name,
              category_hierarchy: index + 1,
            }));

            setSelectedCategories(selectedCats);
            dispatch(updateProductCategories(selectedCats));
            setValue("categoryId", categoryPath[categoryPath.length - 1].id.toString());
          }
        } catch (error) {
          console.error('Error loading initial category:', error);
        }
      }
    };
    loadInitialCategory();
  }, [initialCategoryId, dispatch, setValue]);

  // Effect to handle state updates
  useEffect(() => {
    if (pendingSelection === null) return;

    const { selected, level } = pendingSelection;

    if (selected?.data) {
      setSelectorStates((prev) => {
        const newStates = prev.slice(0, level + 1);
        newStates[level] = {
          ...newStates[level],
          selectedCategories: [selected],
        };

        if (selected.data.children?.length > 0) {
          newStates.push({
            level: level + 1,
            parentId: parseInt(selected.value),
            selectedCategories: [],
            availableOptions: selected.data.children.map((child) => ({
              value: child.id.toString(),
              label: child.name,
              subLabel: child.code,
              data: child,
            })),
          });
        }

        // Prepare new selected categories
        const newSelectedCategories = newStates
          .filter((state) => state.selectedCategories.length > 0)
          .map((state, idx) => ({
            product_category_id: parseInt(state.selectedCategories[0].value),
            product_category_parent: state.selectedCategories[0].data.parent_id,
            product_category_name: state.selectedCategories[0].data.name,
            category_hierarchy: idx + 1,
          }));

        setSelectedCategories(newSelectedCategories);
        return newStates;
      });

      setValue("categoryId", selected.value);
    } else {
      setSelectorStates((prev) => {
        const newStates = prev.slice(0, level + 1);

        const newRemainingCategories = newStates
          .slice(0, level)
          .filter((state) => state.selectedCategories.length > 0)
          .map((state, idx) => ({
            product_category_id: parseInt(state.selectedCategories[0].value),
            product_category_parent: state.selectedCategories[0].data.parent_id,
            product_category_name: state.selectedCategories[0].data.name,
            category_hierarchy: idx + 1,
          }));

        setSelectedCategories(newRemainingCategories);
        return newStates;
      });

      setValue("categoryId", "");
    }

    setPendingSelection(null);
  }, [pendingSelection, dispatch, setValue]);

  // Effect to update Redux store when selectedCategories changes
  useEffect(() => {
    dispatch(updateProductCategories(selectedCategories));
  }, [selectedCategories, dispatch]);

  const handleChange = useCallback(
    (selected: SelectOption | null, level: number) => {
      setPendingSelection({ selected, level });
    },
    []
  );

  return (
    <div className="space-y-4">
      {selectorStates.map((state, index) => (
        <ClientSelect
          key={`category-${state.level}`}
          name={`category-${state.level}`}
          control={control}
          loadOptions={
            index === 0
              ? loadCategoryOptions
              : async () => ({
                  options: state.availableOptions || [],
                  hasMore: false,
                  additional: { page: 1, hasMore: false },
                })
          }
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
  const [initialLoad, setInitialLoad] = useState(true);

  // Add initial load effect
  useEffect(() => {
    if (initialLoad && variants.length > 0 && value?.value) {
      const variant = variants.find(v => v.id.toString() === value.value);
      if (variant) {
        onChange({
          value: variant.id.toString(),
          label: variant.name,
          data: {
            id: variant.id,
            name: variant.name,
            values: variant.values,
          },
        });
      }
      setInitialLoad(false);
    }
  }, [variants, value, onChange, initialLoad]);

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
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "hsl(var(--accent))",
          margin: "2px",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "hsl(var(--accent-foreground))",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "hsl(var(--accent-foreground))",
          padding: "0 4px",
          ":hover": {
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: "2px 6px",
          gap: "2px",
          flexWrap: "wrap",
          maxHeight: "120px",
          overflowY: "auto",
        }),
        control: (base) => ({
          ...base,
          minHeight: "40px",
          height: "auto",
          maxHeight: "120px",
          overflow: "hidden",
        }),
        input: (base) => ({
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