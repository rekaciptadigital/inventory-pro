import { configureStore } from '@reduxjs/toolkit';
import formInventoryProductReducer from './slices/formInventoryProductSlice';

export const store = configureStore({
  reducer: {
    formInventoryProduct: formInventoryProductReducer,
    // ... other reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
