import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type {
  InventoryProductForm,
  ProductCategory,
  ProductVariant,
  ProductByVariant,
} from "../types/inventory";

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
    setVariants: (state, action: PayloadAction<ProductVariant[]>) => {
      state.variants = action.payload;
    },
    setProductByVariant: (state, action: PayloadAction<ProductByVariant[]>) => {
      state.product_by_variant = action.payload;
    },
    resetForm: () => initialState,
  },
});

// Export actions
export const {
  updateForm,
  setBrand,
  setProductType,
  setCategories,
  setVariants,
  setProductByVariant,
  resetForm,
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

export default formInventoryProductSlice.reducer;
