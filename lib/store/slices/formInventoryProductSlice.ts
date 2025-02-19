import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type {
  InventoryProductForm,
  ProductCategory,
  ProductByVariant,
  VariantSelectorData,
  ProductVariant,
} from "../types/inventory";

// Define the VariantValue type based on ProductVariant interface
type VariantValue = ProductVariant['variant_values'][number];

// Remove redundant type alias
// type CategoryHierarchy = number;

interface InventoryProductForm {
  brand_id: number | null;
  brand_code: string;
  brand_name: string;
  product_type_id: number | null;
  product_type_code: string;
  product_type_name: string;
  unique_code: string;
  sku: string;
  product_name: string;
  full_product_name: string;
  vendor_sku: string;
  description: string;
  unit: string;
  slug: string;
  categories: ProductCategory[];
  availableCategories: ProductCategory[]; // Add this new field
  variants: ProductVariant[];
  product_by_variant: ProductByVariant[];
  variant_selectors: VariantSelectorData[];
}

interface ProductByVariant {
  originalSkuKey: string;
  sku: string;
  sku_product_unique_code: string;
  full_product_name: string;
  vendor_sku?: string; // Add optional vendor SKU
}

const initialState: InventoryProductForm = {
  brand_id: null,
  brand_code: "",
  brand_name: "",
  product_type_id: null,
  product_type_code: "",
  product_type_name: "",
  unique_code: "",
  sku: "",
  product_name: "",
  full_product_name: "",
  vendor_sku: "",
  description: "",
  unit: "PC",
  slug: "", // Add initial value for slug
  categories: [],
  availableCategories: [], // Initialize new field
  variants: [],
  product_by_variant: [],
  variant_selectors: [], // Make sure this matches the imported type
};

const formInventoryProductSlice = createSlice({
  name: "formInventoryProduct",
  initialState,
  reducers: {
    updateForm: (
      state,
      action: PayloadAction<Partial<InventoryProductForm>>
    ) => {
      if (action.payload.product_by_variant) {
        // Preserve existing vendor SKUs when updating product_by_variant
        action.payload.product_by_variant = action.payload.product_by_variant.map(variant => ({
          ...variant,
          vendor_sku: variant.vendor_sku || state.product_by_variant.find(
            v => v.originalSkuKey === variant.originalSkuKey
          )?.vendor_sku
        }));
      }
      return { ...state, ...action.payload };
    },
    setBrand: (
      state,
      action: PayloadAction<{ id: number; code: string; name: string }>
    ) => {
      state.brand_id = action.payload.id;
      state.brand_code = action.payload.code;
      state.brand_name = action.payload.name;
    },
    setProductType: (
      state,
      action: PayloadAction<{ id: number; code: string; name: string }>
    ) => {
      state.product_type_id = action.payload.id;
      state.product_type_code = action.payload.code;
      state.product_type_name = action.payload.name;
    },
    setCategories: (state, action: PayloadAction<ProductCategory[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<ProductCategory>) => {
      const hierarchyToMatch = Number(action.payload.category_hierarchy);
      
      const filteredCategories = state.categories.filter(
        (cat) => Number(cat.category_hierarchy) !== hierarchyToMatch
      );
      
      // Add the new category
      filteredCategories.push({
        ...action.payload,
        category_hierarchy: hierarchyToMatch
      });
      
      // Sort categories by hierarchy in a separate operation
      state.categories = filteredCategories.toSorted(
        (a, b) => Number(a.category_hierarchy) - Number(b.category_hierarchy)
      );
    },
    removeCategory: (state, action: PayloadAction<number>) => {
      const hierarchyThreshold = action.payload;
      state.categories = state.categories.filter(
        (cat: ProductCategory) => Number(cat.category_hierarchy) < hierarchyThreshold
      );
    },
    setVariants: (state, action: PayloadAction<ProductVariant[]>) => {  // Change Variant to ProductVariant
      state.variants = action.payload;
    },
    setProductByVariant: (state, action: PayloadAction<ProductByVariant[]>) => {
      state.product_by_variant = action.payload;
    },
    resetForm: () => initialState,
    updateProductCategories: (
      state,
      action: PayloadAction<ProductCategory[]>
    ) => {
      // Enhanced validation and processing
      if (!action.payload || !Array.isArray(action.payload)) {
        state.categories = [];
        return;
      }
      
      const validCategories = action.payload.filter(
        cat => cat.product_category_id && 
        typeof cat.category_hierarchy === 'number'
      );
      
      state.categories = validCategories.sort(
        (a, b) => a.category_hierarchy - b.category_hierarchy
      );
    },
    updateSkuInfo: (
      state,
      action: PayloadAction<{ sku: string; unique_code: string }>
    ) => {
      state.sku = action.payload.sku;
      state.unique_code = action.payload.unique_code;
    },
    updateVariant: (
      state,
      action: PayloadAction<{
        variantId: number;
        values: VariantValue[];
      }>
    ) => {
      const variantIndex = state.variants.findIndex(
        (v) => Number(v.variant_id) === action.payload.variantId  // Convert to number for comparison
      );
      if (variantIndex !== -1) {
        state.variants[variantIndex].variant_values = action.payload.values;
      }
    },
    // Add new reducers for variant selectors
    addVariantSelector: (state, action: PayloadAction<VariantSelectorData>) => {
      state.variant_selectors.push(action.payload);
    },
    updateVariantSelector: (
      state,
      action: PayloadAction<{ id: number; data: Partial<VariantSelectorData> }>
    ) => {
      const index = state.variant_selectors.findIndex(
        (v) => v.id === action.payload.id
      );
      if (index !== -1) {
        state.variant_selectors[index] = {
          ...state.variant_selectors[index],
          ...action.payload.data,
        };
      }
    },
    removeVariantSelector: (state, action: PayloadAction<number>) => {
      state.variant_selectors = state.variant_selectors.filter(
        (v) => v.id !== action.payload
      );
    },
    setVariantSelectors: (
      state,
      action: PayloadAction<VariantSelectorData[]>
    ) => {
      state.variant_selectors = action.payload;
    },
    updateVariantSelectorValues: (
      state,
      action: PayloadAction<{ id: number; selected_values: string[] }>
    ) => {
      const index = state.variant_selectors.findIndex(
        (v) => v.id === action.payload.id
      );
      if (index !== -1) {
        state.variant_selectors[index].selected_values =
          action.payload.selected_values;
      }
    },
    clearVariantSelectors: (state) => {
      state.variant_selectors = [];
    },
    resetFormState: () => {
      return initialState;
    },
    resetCategories: (state) => {
      state.categories = [];
    },
    setAvailableCategories: (state, action: PayloadAction<ProductCategory[]>) => {
      state.availableCategories = action.payload;
    },
  },
});

// Export actions
export const {
  updateForm,
  setBrand,
  setProductType,
  setCategories,
  addCategory,
  removeCategory,
  setVariants,
  setProductByVariant,
  resetForm,
  updateProductCategories,
  updateSkuInfo,
  updateVariant,
  addVariantSelector,
  updateVariantSelector,
  removeVariantSelector,
  setVariantSelectors,
  updateVariantSelectorValues,
  clearVariantSelectors,
  resetFormState,
  resetCategories,
  setAvailableCategories,
} = formInventoryProductSlice.actions;

// Memoized selectors
export const selectFormInventoryProduct = (state: RootState) =>
  state.formInventoryProduct;

export const selectBrand = createSelector(
  selectFormInventoryProduct,
  (form) => ({
    id: form.brand_id,
    code: form.brand_code,
    name: form.brand_name,
  })
);

export const selectProductType = createSelector(
  selectFormInventoryProduct,
  (form) => ({
    id: form.product_type_id,
    code: form.product_type_code,
    name: form.product_type_name,
  })
);

export const selectSkuDetails = createSelector(
  selectFormInventoryProduct,
  (form) => ({
    sku: form.sku,
    uniqueCode: form.unique_code,
  })
);

export const selectSkuInfo = createSelector(
  selectFormInventoryProduct,
  (form) => ({
    sku: form.sku,
    unique_code: form.unique_code,
  })
);

export const selectProductNames = createSelector(
  selectFormInventoryProduct,
  (form) => ({
    product_name: form.product_name,
    full_product_name: form.full_product_name,
  })
);

export const selectProductDetails = createSelector(
  selectFormInventoryProduct,
  (form) => ({
    vendor_sku: form.vendor_sku,
    description: form.description,
  })
);

export const selectUnit = createSelector(
  selectFormInventoryProduct,
  (form) => form.unit
);

export const selectVariants = createSelector(
  selectFormInventoryProduct,
  (form) => form.variants
);

export const selectVariantsWithValues = createSelector(
  selectFormInventoryProduct,
  (form) => form.variants
);

// Add new memoized selector for sorted categories
export const selectSortedCategories = createSelector(
  selectFormInventoryProduct,
  (form) => [...form.categories].sort((a, b) => a.category_hierarchy - b.category_hierarchy)
);

// Add new selector
export const selectVariantSelectors = createSelector(
  selectFormInventoryProduct,
  (form) => form.variant_selectors
);

// Add new selector for available categories
export const selectAvailableCategories = createSelector(
  selectFormInventoryProduct,
  (form) => form.availableCategories
);

export default formInventoryProductSlice.reducer;
