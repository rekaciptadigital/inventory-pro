import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/lib/services/auth.service';
import { setTokens, setUser, clearAuthData } from '@/lib/services/auth/storage.service';
import type { AuthUser, AuthTokens, LoginCredentials } from '@/lib/types/auth';
import type { RootState } from '../store';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

interface InitializeAuthPayload {
  user: AuthUser;
  tokens: AuthTokens;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    if (!credentials.email || !credentials.password) {
      return rejectWithValue('Email and password are required');
    }

    try {
      const response = await authService.login(credentials);
      
      // Store auth data
      setTokens(response.tokens);
      setUser(response.data);

      return {
        user: response.data,
        tokens: response.tokens,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.status?.message 
        || error.message 
        || 'Failed to login';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  clearAuthData(); // Make sure this clears both tokens and user
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state, action: PayloadAction<InitializeAuthPayload>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, initializeAuth } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectTokens = (state: RootState) => state.auth.tokens;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;