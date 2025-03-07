import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import formInventoryProductReducer from "./slices/formInventoryProductSlice";
import priceCategoriesReducer from "./slices/priceCategoriesSlice";
import variantPricesReducer from "./slices/variantPricesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    formInventoryProduct: formInventoryProductReducer,
    priceCategories: priceCategoriesReducer,
    variantPrices: variantPricesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/login/fulfilled", "auth/login/rejected"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;