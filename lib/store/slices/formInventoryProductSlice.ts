import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type {
  InventoryProductForm,
  ProductCategory,
  ProductVariant,
  ProductByVariant,
} from "../types/inventory";

interface ProductCategory {
  product_category_id: number;
  product_category_parent: number | null;
  product_category_name: string;
  category_hierarchy: number;
}

interface VariantValue {
  variant_value_id: number;
  variant_value_name: string;
}

interface Variant {
  variant_id: number;
  variant_name: string;
  variant_values: VariantValue[];
}

// Add new interface for variant selector
interface VariantSelectorData {
  id: number;
  name: string;
  values: string[];
  selected_values?: string[];
}

export interface InventoryProductForm {
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
  slug: string; // Make sure slug is included in the interface
  categories: ProductCategory[];
  variants: Variant[];
  product_by_variant: ProductByVariant[];
  variant_selectors: VariantSelectorData[]; // Add new property
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
  variants: [],
  product_by_variant: [],
  variant_selectors: [], // Add new initial state
};

const formInventoryProductSlice = createSlice({
  name: "formInventoryProduct",
  initialState,
  reducers: {
    updateForm: (
      state,
      action: PayloadAction<Partial<InventoryProductForm>>
    ) => {
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
      // Remove any existing category with the same hierarchy
      state.categories = state.categories.filter(
        (cat) => cat.category_hierarchy !== action.payload.category_hierarchy
      );
      // Add the new category
      state.categories.push(action.payload);
      // Sort by hierarchy
      state.categories.sort(
        (a, b) => a.category_hierarchy - b.category_hierarchy
      );
    },
    removeCategory: (state, action: PayloadAction<number>) => {
      // Remove the category and all its children (higher hierarchy levels)
      state.categories = state.categories.filter(
        (cat) => cat.category_hierarchy < action.payload
      );
    },
    setVariants: (state, action: PayloadAction<Variant[]>) => {
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
      // Replace all categories with the new array
      state.categories = action.payload.sort(
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
        (v) => v.variant_id === action.payload.variantId
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

// Add new selector
export const selectVariantSelectors = createSelector(
  selectFormInventoryProduct,
  (form) => form.variant_selectors
);

export default formInventoryProductSlice.reducer;
