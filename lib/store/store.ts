import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import priceCategoriesReducer from "./slices/priceCategoriesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    priceCategories: priceCategoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/login/fulfilled", "auth/login/rejected"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
