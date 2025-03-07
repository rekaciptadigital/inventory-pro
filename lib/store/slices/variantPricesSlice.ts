import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface VariantPrice {
  prices: Record<string, number>;
}

interface VariantPricesState {
  manualPriceEditing: boolean;
  prices: Record<string, VariantPrice>;
}

const initialState: VariantPricesState = {
  manualPriceEditing: false,
  prices: {},
};

export const variantPricesSlice = createSlice({
  name: "variantPrices",
  initialState,
  reducers: {
    setManualPriceEditing: (state, action: PayloadAction<boolean>) => {
      state.manualPriceEditing = action.payload;
    },
    initializeVariantPrices: (
      state,
      action: PayloadAction<{
        variants: Array<{ sku_product_variant: string }>;
        categories: Array<{ id: string; name: string }>;
        customerPrices: Record<string, { taxInclusivePrice: number }>;
      }>
    ) => {
      const { variants, categories, customerPrices } = action.payload;
      
      variants.forEach(variant => {
        if (!state.prices[variant.sku_product_variant]) {
          state.prices[variant.sku_product_variant] = {
            prices: {},
          };
        }
        
        categories.forEach(category => {
          state.prices[variant.sku_product_variant].prices[category.id] = 
            customerPrices[category.id]?.taxInclusivePrice || 0;
        });
      });
    },
    updateVariantPrices: (
      state,
      action: PayloadAction<{
        variants: Array<{ sku_product_variant: string }>;
        categories: Array<{ id: string; name: string }>;
        customerPrices: Record<string, { taxInclusivePrice: number }>;
      }>
    ) => {
      if (state.manualPriceEditing) return; // Don't update if manual editing is on
      
      const { variants, categories, customerPrices } = action.payload;
      
      variants.forEach(variant => {
        if (!state.prices[variant.sku_product_variant]) {
          state.prices[variant.sku_product_variant] = {
            prices: {},
          };
        }
        
        categories.forEach(category => {
          state.prices[variant.sku_product_variant].prices[category.id] = 
            customerPrices[category.id]?.taxInclusivePrice || 0;
        });
      });
    },
    updateVariantPrice: (
      state,
      action: PayloadAction<{
        sku: string;
        category: string;
        price: number;
      }>
    ) => {
      const { sku, category, price } = action.payload;
      if (state.prices[sku]) {
        state.prices[sku].prices[category] = price;
      }
    },
  },
});

export const {
  setManualPriceEditing,
  initializeVariantPrices,
  updateVariantPrices,
  updateVariantPrice,
} = variantPricesSlice.actions;

export default variantPricesSlice.reducer;
