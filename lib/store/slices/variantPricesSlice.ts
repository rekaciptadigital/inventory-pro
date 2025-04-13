import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VariantPricesState {
  manualPriceEditing: boolean;
  variantData: Record<string, {
    usdPrice: number;
    adjustmentPercentage: number;
  }>;
  prices: Record<string, {
    usdPrice?: number;
    adjustmentPercentage?: number;
    prices: Record<string, number>;
    marketplacePrices?: Record<string, number>;
  }>;
}

const initialState: VariantPricesState = {
  manualPriceEditing: false,
  variantData: {},
  prices: {}
};

// Categories should be { id: string, name: string }[]
interface InitializePayload {
  variants: any[];
  categories: any[];
  customerPrices: Record<string, any>;
  pricingInfo: {
    usdPrice: number;
    adjustmentPercentage: number;
  };
}

const variantPricesSlice = createSlice({
  name: 'variantPrices',
  initialState,
  reducers: {
    // Toggle manual price editing mode
    setManualPriceEditing: (state, action: PayloadAction<boolean>) => {
      state.manualPriceEditing = action.payload;
    },
    
    // Initialize variant data with explicit typing for the action
    initializeVariantData: (state, action: PayloadAction<Record<string, {
      usdPrice: number;
      adjustmentPercentage: number;
    }>>) => {
      // Ensure it's a valid object before assigning
      if (action.payload && typeof action.payload === 'object') {
        state.variantData = { ...action.payload };
      }
    },
    
    // Update USD price for a variant
    updateVariantUsdPrice: (state, action: PayloadAction<{
      sku: string;
      price: number;
    }>) => {
      const { sku, price } = action.payload;
      
      // Ensure variant exists in state
      if (!state.variantData[sku]) {
        state.variantData[sku] = { usdPrice: 0, adjustmentPercentage: 0 };
      }
      
      // Update USD price
      state.variantData[sku].usdPrice = price;
      
      // Also update in prices object for backward compatibility
      if (!state.prices[sku]) {
        state.prices[sku] = { prices: {}, marketplacePrices: {} };
      }
      state.prices[sku].usdPrice = price;
    },
    
    // Update adjustment percentage for a variant
    updateVariantAdjustment: (state, action: PayloadAction<{
      sku: string;
      percentage: number;
    }>) => {
      const { sku, percentage } = action.payload;
      
      // Ensure variant exists in state
      if (!state.variantData[sku]) {
        state.variantData[sku] = { usdPrice: 0, adjustmentPercentage: 0 };
      }
      
      // Update adjustment percentage
      state.variantData[sku].adjustmentPercentage = percentage;
      
      // Also update in prices object for backward compatibility
      if (!state.prices[sku]) {
        state.prices[sku] = { prices: {}, marketplacePrices: {} };
      }
      state.prices[sku].adjustmentPercentage = percentage;
    },
    
    // Initialize variant prices with default values (kept for backwards compatibility)
    initializeVariantPrices: (state, action: PayloadAction<InitializePayload>) => {
      const { variants, categories, customerPrices, pricingInfo } = action.payload;

      // Reset prices object
      state.prices = {};

      // Initialize each variant
      variants.forEach(variant => {
        const sku = variant.sku_product_variant;
        if (!sku) return;
        
        // Create prices object for this variant
        const prices: Record<string, number> = {};
        
        // Set prices for each category based on customer pricing rules
        categories.forEach(category => {
          const categoryData = customerPrices[category.id];
          let price = 0;
          
          if (categoryData && 'taxInclusivePrice' in categoryData) {
            price = categoryData.taxInclusivePrice;
          }
          
          prices[category.id] = price;
        });
        
        // Add the variant with initial properties
        state.prices[sku] = {
          usdPrice: pricingInfo.usdPrice,
          adjustmentPercentage: pricingInfo.adjustmentPercentage,
          prices,
          marketplacePrices: {}
        };
      });
    },
    
    // Update all variant prices (kept for backwards compatibility)
    updateVariantPrices: (state, action: PayloadAction<InitializePayload>) => {
      const { variants, categories, customerPrices } = action.payload;
      
      // For each variant that exists
      variants.forEach(variant => {
        const sku = variant.sku_product_variant;
        if (!sku || !state.prices[sku]) return;
        
        // Only update if not in manual editing mode
        if (!state.manualPriceEditing) {
          // Update each category price
          categories.forEach(category => {
            const categoryData = customerPrices[category.id];
            let price = 0;
            
            if (categoryData && 'taxInclusivePrice' in categoryData) {
              price = categoryData.taxInclusivePrice;
            }
            
            // Set the new price for this category
            if (!state.prices[sku].prices) {
              state.prices[sku].prices = {};
            }
            state.prices[sku].prices[category.id] = price;
          });
        }
      });
    },
    
    // Update a specific price for a variant and category (kept for backwards compatibility)
    updateVariantPrice: (state, action: PayloadAction<{ 
      sku: string; 
      category: string; 
      price: number;
    }>) => {
      const { sku, category, price } = action.payload;
      
      // Ensure variant and prices exist
      if (!state.prices[sku]) {
        state.prices[sku] = { prices: {}, marketplacePrices: {} };
      }
      
      if (!state.prices[sku].prices) {
        state.prices[sku].prices = {};
      }
      
      // Update the price
      state.prices[sku].prices[category] = price;
    },
    
    // Update marketplace price for a variant (kept for backwards compatibility)
    updateVariantMarketplacePrice: (state, action: PayloadAction<{
      sku: string;
      marketplace: string;
      price: number;
    }>) => {
      const { sku, marketplace, price } = action.payload;
      
      // Ensure variant and marketplacePrices exist
      if (!state.prices[sku]) {
        state.prices[sku] = { prices: {}, marketplacePrices: {} };
      }
      
      if (!state.prices[sku].marketplacePrices) {
        state.prices[sku].marketplacePrices = {};
      }
      
      // Update the marketplace price
      state.prices[sku].marketplacePrices[marketplace] = price;
    }
  }
});

// Export actions from the slice
export const {
  setManualPriceEditing,
  initializeVariantData,
  updateVariantUsdPrice,
  updateVariantAdjustment,
  initializeVariantPrices,
  updateVariantPrices,
  updateVariantPrice,
  updateVariantMarketplacePrice
} = variantPricesSlice.actions;

export default variantPricesSlice.reducer;
