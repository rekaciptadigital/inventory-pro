import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import formInventoryProductReducer from "./slices/formInventoryProductSlice";
import priceCategoriesReducer from "./slices/priceCategoriesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    formInventoryProduct: formInventoryProductReducer,
    priceCategories: priceCategoriesReducer,
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