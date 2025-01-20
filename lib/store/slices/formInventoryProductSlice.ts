import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  slug: string;
  categories: ProductCategory[];
  variants: ProductVariant[];
  product_by_variant: ProductByVariant[];
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
  slug: "",
  categories: [],
  variants: [],
  product_by_variant: [],
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
    setVariants: (state, action: PayloadAction<ProductVariant[]>) => {
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
} = formInventoryProductSlice.actions;

// Export selectors
export const selectFormInventoryProduct = (state: RootState) =>
  state.formInventoryProduct;
export const selectBrand = (state: RootState) => ({
  id: state.formInventoryProduct.brand_id,
  code: state.formInventoryProduct.brand_code,
  name: state.formInventoryProduct.brand_name,
});
export const selectProductType = (state: RootState) => ({
  id: state.formInventoryProduct.product_type_id,
  code: state.formInventoryProduct.product_type_code,
  name: state.formInventoryProduct.product_type_name,
});
export const selectSkuDetails = (state: RootState) => ({
  sku: state.formInventoryProduct.sku,
  uniqueCode: state.formInventoryProduct.unique_code,
});
export const selectSkuInfo = (state: RootState) => ({
  sku: state.formInventoryProduct.sku,
  unique_code: state.formInventoryProduct.unique_code,
});

export default formInventoryProductSlice.reducer;
