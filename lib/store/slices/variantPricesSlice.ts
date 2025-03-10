import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface VariantPrice {
  marketplacePrices: Record<string, number>;
  prices: Record<string, number>;
  usdPrice: number;
  adjustmentPercentage: number;
  marketplaceMarkups?: Record<string, number>; // New field
}

interface VariantPricesState {
  manualPriceEditing: boolean;
  prices: Record<string, VariantPrice>;
}

const initialState: VariantPricesState = {
  manualPriceEditing: false,
  prices: {},
};

interface UpdateVariantMarketplacePricePayload {
  sku: string;
  marketplace: string;
  price: number;
}

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
        pricingInfo?: {
          usdPrice?: number;
          adjustmentPercentage?: number;
        };
      }>
    ) => {
      const { variants, categories, customerPrices, pricingInfo } = action.payload;
      const defaultUsdPrice = pricingInfo?.usdPrice ?? 0; // Use nullish coalescing
      const defaultAdjustment = pricingInfo?.adjustmentPercentage ?? 0; // Use nullish coalescing
      
      variants.forEach(variant => {
        const sku = variant.sku_product_variant;
        
        // Initialize if not exists
        if (!state.prices[sku]) {
          state.prices[sku] = {
            prices: {},
            usdPrice: defaultUsdPrice,
            adjustmentPercentage: defaultAdjustment,
            marketplacePrices: {} // Add this line
          };
        } else {
          // Update default values while preserving existing structure
          state.prices[sku] = {
            ...state.prices[sku],
            usdPrice: defaultUsdPrice,
            adjustmentPercentage: defaultAdjustment
          };
        }
        
        categories.forEach(category => {
          state.prices[sku].prices[category.id] = 
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
        pricingInfo?: {
          usdPrice?: number;
          adjustmentPercentage?: number;
        };
      }>
    ) => {
      if (state.manualPriceEditing) return; // Don't update if manual editing is on
      
      const { variants, categories, customerPrices, pricingInfo } = action.payload;
      const defaultUsdPrice = pricingInfo?.usdPrice ?? 0; // Use nullish coalescing
      const defaultAdjustment = pricingInfo?.adjustmentPercentage ?? 0; // Use nullish coalescing
      
      variants.forEach(variant => {
        const sku = variant.sku_product_variant;
        
        // Initialize if not exists
        if (!state.prices[sku]) {
          state.prices[sku] = {
            prices: {},
            usdPrice: defaultUsdPrice,
            adjustmentPercentage: defaultAdjustment,
            marketplacePrices: {} // Add this line
          };
        }
        
        // Don't update USD price and adjustment if manual editing is on
        if (!state.manualPriceEditing) {
          state.prices[sku].usdPrice = defaultUsdPrice;
          state.prices[sku].adjustmentPercentage = defaultAdjustment;
        }
        
        categories.forEach(category => {
          state.prices[sku].prices[category.id] = 
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
    updateVariantUsdPrice: (
      state,
      action: PayloadAction<{
        sku: string;
        price: number;
      }>
    ) => {
      const { sku, price } = action.payload;
      console.log(`Updating USD price for ${sku} to ${price}`);
      
      if (!state.prices[sku]) {
        // Create the variant if it doesn't exist
        state.prices[sku] = {
          prices: {},
          usdPrice: price,
          adjustmentPercentage: 0,
          marketplacePrices: {} // Add this line
        };
      } else {
        state.prices[sku].usdPrice = price;
      }
    },
    updateVariantAdjustment: (
      state,
      action: PayloadAction<{
        sku: string;
        percentage: number;
      }>
    ) => {
      const { sku, percentage } = action.payload;
      console.log(`Updating adjustment for ${sku} to ${percentage}%`);
      
      if (!state.prices[sku]) {
        // Create the variant if it doesn't exist
        state.prices[sku] = {
          prices: {},
          usdPrice: 0,
          adjustmentPercentage: percentage,
          marketplacePrices: {} // Add this line
        };
      } else {
        state.prices[sku].adjustmentPercentage = percentage;
      }
    },
    updateVariantMarketplacePrice: (state, action: PayloadAction<UpdateVariantMarketplacePricePayload>) => {
      const { sku, marketplace, price } = action.payload;
      if (state.prices[sku]) {
        if (!state.prices[sku].marketplacePrices) {
          state.prices[sku].marketplacePrices = {};
        }
        state.prices[sku].marketplacePrices[marketplace] = price;
      }
    },
    updateVariantMarketplaceMarkup: (
      state,
      action: PayloadAction<{
        sku: string;
        marketplace: string;
        markup: number;
      }>
    ) => {
      const { sku, marketplace, markup } = action.payload;
      if (state.prices[sku]) {
        // Initialize marketplaceMarkups if it doesn't exist
        if (!state.prices[sku].marketplaceMarkups) {
          state.prices[sku].marketplaceMarkups = {};
        }
        state.prices[sku].marketplaceMarkups[marketplace] = markup;
      }
    },
  },
});

export const {
  setManualPriceEditing,
  initializeVariantPrices,
  updateVariantPrices,
  updateVariantPrice,
  updateVariantUsdPrice,
  updateVariantAdjustment,
  updateVariantMarketplacePrice,
  updateVariantMarketplaceMarkup,
} = variantPricesSlice.actions;

export default variantPricesSlice.reducer;
