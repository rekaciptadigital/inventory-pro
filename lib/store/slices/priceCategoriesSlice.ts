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
  ecommerceCategories: PriceCategory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PriceCategoriesState = {
  customerCategories: [],
  ecommerceCategories: [],
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
        type: "Customer" | "Ecommerce";
        category: PriceCategory;
      }>
    ) => {
      const { type, category } = action.payload;
      if (type === "Customer") {
        state.customerCategories.push({
          ...category,
          type: "customer",
          temp_key: `temp_${Date.now()}_${Math.random()}`,
        });
      } else {
        state.ecommerceCategories.push({
          ...category,
          type: "ecommerce",
          temp_key: `temp_${Date.now()}_${Math.random()}`,
        });
      }
    },
    updateCategory: (
      state,
      action: PayloadAction<{
        type: "Customer" | "Ecommerce";
        category: PriceCategory;
      }>
    ) => {
      const { type, category } = action.payload;
      if (type === "Customer") {
        const index = state.customerCategories.findIndex(
          (cat) => cat.id === category.id
        );
        if (index !== -1) {
          state.customerCategories[index] = category;
        }
      } else {
        const index = state.ecommerceCategories.findIndex(
          (cat) => cat.id === category.id
        );
        if (index !== -1) {
          state.ecommerceCategories[index] = category;
        }
      }
    },
    deleteCategory: (
      state,
      action: PayloadAction<{
        type: "Customer" | "Ecommerce";
        id: number | null;
        temp_key?: string;
      }>
    ) => {
      const { type, id, temp_key } = action.payload;

      // Function untuk filter kategori
      const filterCategories = (categories: PriceCategory[]) => {
        if (id === null) {
          // Case 2: Jika id null, filter berdasarkan temp_key
          return categories.filter((cat) => cat.temp_key !== temp_key);
        }
        // Case 1: Jika id tidak null, filter berdasarkan id
        return categories.filter((cat) => cat.id !== id);
      };

      if (type === "Customer") {
        state.customerCategories = filterCategories(state.customerCategories);
      } else {
        state.ecommerceCategories = filterCategories(state.ecommerceCategories);
      }
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
        action.payload.forEach((group: GroupedPriceCategories) => {
          const categories = group.categories.map((category) => ({
            ...category,
            temp_key: `temp_${Date.now()}_${category.id}`,
          }));

          if (group.type.toLowerCase() === "customer") {
            state.customerCategories = categories;
          } else if (group.type.toLowerCase() === "eccomerce") {
            state.ecommerceCategories = categories;
          }
        });
      })
      .addCase(fetchPriceCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addCategory, updateCategory, deleteCategory } =
  priceCategoriesSlice.actions;

export const selectCustomerCategories = (state: RootState) =>
  state.priceCategories.customerCategories;
export const selectEcommerceCategories = (state: RootState) =>
  state.priceCategories.ecommerceCategories;
export const selectIsLoading = (state: RootState) =>
  state.priceCategories.isLoading;
export const selectError = (state: RootState) => state.priceCategories.error;

export default priceCategoriesSlice.reducer;
