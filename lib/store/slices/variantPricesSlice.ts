import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VariantPricesState {
  manualPriceEditing: boolean;
  prices: Record<string, {
    usdPrice?: number;
    adjustmentPercentage?: number;
    prices: Record<string, number>;
    marketplacePrices?: Record<string, number>;
  }>;
}

const initialState: VariantPricesState = {
  manualPriceEditing: false,
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

export const variantPricesSlice = createSlice({
  name: 'variantPrices',
  initialState,
  reducers: {
    // Toggle manual price editing mode
    setManualPriceEditing: (state, action: PayloadAction<boolean>) => {
      state.manualPriceEditing = action.payload;
    },
    
    // Initialize variant prices with default values
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
    
    // Update all variant prices based on new customer pricing
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
    
    // Update a specific price for a variant and category
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
    
    // Update USD price for a variant
    updateVariantUsdPrice: (state, action: PayloadAction<{
      sku: string;
      price: number;
    }>) => {
      const { sku, price } = action.payload;
      
      // Ensure variant exists
      if (!state.prices[sku]) {
        state.prices[sku] = { prices: {}, marketplacePrices: {} };
      }
      
      // Update USD price
      state.prices[sku].usdPrice = price;
    },
    
    // Update adjustment percentage for a variant
    updateVariantAdjustment: (state, action: PayloadAction<{
      sku: string;
      percentage: number;
    }>) => {
      const { sku, percentage } = action.payload;
      
      // Ensure variant exists
      if (!state.prices[sku]) {
        state.prices[sku] = { prices: {}, marketplacePrices: {} };
      }
      
      // Update adjustment percentage
      state.prices[sku].adjustmentPercentage = percentage;
    },
    
    // Update marketplace price for a variant
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

export const {
  setManualPriceEditing,
  initializeVariantPrices,
  updateVariantPrices,
  updateVariantPrice,
  updateVariantUsdPrice,
  updateVariantAdjustment,
  updateVariantMarketplacePrice
} = variantPricesSlice.actions;

export default variantPricesSlice.reducer;
