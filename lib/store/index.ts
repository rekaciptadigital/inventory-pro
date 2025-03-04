import { configureStore } from '@reduxjs/toolkit';
import formInventoryProductReducer from './slices/formInventoryProductSlice';

export const store = configureStore({
  reducer: {
    formInventoryProduct: formInventoryProductReducer,
  },
});

// Export type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export slice actions and selectors
export * from './slices/formInventoryProductSlice';
