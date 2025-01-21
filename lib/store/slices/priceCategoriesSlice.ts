import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getPriceCategories } from "@/lib/api/price-categories";
import type {
  PriceCategory,
  GroupedPriceCategories,
  PriceCategoryFormData,
} from "@/lib/api/price-categories";
import type { RootState } from "../store";

interface PriceCategoriesState {
  customerCategories: PriceCategory[];
  marketplaceCategories: PriceCategory[];
  defaultCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PriceCategoriesState = {
  customerCategories: [],
  marketplaceCategories: [],
  defaultCategoryId: null,
  isLoading: false,
  error: null,
};

// Async thunk untuk fetch categories
export const fetchPriceCategories = createAsyncThunk(
  "priceCategories/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPriceCategories();
      // Tambahkan temp_key ke setiap kategori sebelum mengembalikan data
      const processedData = response.data.map((group) => ({
        ...group,
        categories: group.categories.map((category) => ({
          ...category,
          temp_key: `existing_${category.id}_${Date.now()}`,
        })),
      }));
      return processedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const priceCategoriesSlice = createSlice({
  name: "priceCategories",
  initialState,
  reducers: {
    addCategory: (
      state,
      action: PayloadAction<{
        type: "Customer" | "Marketplace";
        category: PriceCategory;
      }>
    ) => {
      const { type, category } = action.payload;
      // Remove toast notification from here, it should be handled in the component
      if (type === "Customer") {
        state.customerCategories.push({
          ...category,
          type: "customer",
        });
      } else {
        state.marketplaceCategories.push({
          ...category,
          type: "marketplace",
        });
      }
    },
    updateCategory: (
      state,
      action: PayloadAction<{
        type: "Customer" | "Marketplace";
        category: PriceCategory;
      }>
    ) => {
      const { type, category } = action.payload;
      if (type === "Customer") {
        const index = state.customerCategories.findIndex(
          (cat) => String(cat.id) === String(category.id) // Convert to string for comparison
        );
        if (index !== -1) {
          state.customerCategories[index] = category;
        }
      } else {
        const index = state.marketplaceCategories.findIndex(
          (cat) => String(cat.id) === String(category.id) // Convert to string for comparison
        );
        if (index !== -1) {
          state.marketplaceCategories[index] = category;
        }
      }
    },
    deleteCategory: (
      state,
      action: PayloadAction<{
        type: "Customer" | "Marketplace"; // Update type to match new naming
        id: number | null;
        temp_key?: string;
      }>
    ) => {
      const { type, id, temp_key } = action.payload;

      // Function untuk filter kategori
      const filterCategories = (categories: PriceCategory[]) => {
        if (id === null && temp_key) {
          // Case 2: Jika id null, filter berdasarkan temp_key
          return categories.filter((cat) => cat.temp_key !== temp_key);
        }
        // Case 1: Jika id tidak null, filter berdasarkan id
        return categories.filter((cat) => cat.id !== id);
      };

      if (type === "Customer") {
        state.customerCategories = filterCategories(state.customerCategories);
      } else if (type === "Marketplace") {
        // Update dari "Ecommerce" ke "Marketplace"
        state.marketplaceCategories = filterCategories(
          state.marketplaceCategories
        );
      }
    },
    setDefaultCategory: (state, action: PayloadAction<string>) => {
      state.defaultCategoryId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriceCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPriceCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        // Reset state arrays
        state.customerCategories = [];
        state.marketplaceCategories = []; // Rename dari ecommerceCategories

        action.payload.forEach((group: GroupedPriceCategories) => {
          const categories = group.categories.map((category) => ({
            ...category,
            temp_key: `temp_${Date.now()}_${category.id}`,
            percentage: Number(category.percentage), // Convert string percentage to number
          }));

          if (group.type.toLowerCase() === "customer") {
            state.customerCategories = categories;
          } else if (group.type.toLowerCase() === "marketplace") {
            state.marketplaceCategories = categories; // Rename dari ecommerceCategories
          }
        });
      })
      .addCase(fetchPriceCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addCategory, updateCategory, deleteCategory, setDefaultCategory } =
  priceCategoriesSlice.actions;

export const selectCustomerCategories = (state: RootState) =>
  state.priceCategories.customerCategories;
export const selectMarketplaceCategories = (
  state: RootState // Rename dari selectEcommerceCategories
) => state.priceCategories.marketplaceCategories;
export const selectDefaultCategory = (state: RootState) => state.priceCategories.defaultCategoryId;
export const selectIsLoading = (state: RootState) =>
  state.priceCategories.isLoading;
export const selectError = (state: RootState) => state.priceCategories.error;

export default priceCategoriesSlice.reducer;