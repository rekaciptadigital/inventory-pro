import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/lib/services/auth.service";
import type { AuthUser, AuthTokens, LoginCredentials } from "@/lib/types/auth";
import type { RootState } from "../store";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getCurrentUser(),
  tokens: authService.getTokens(),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("tokens", JSON.stringify(response.tokens));

      return {
        user: response.data,
        tokens: response.tokens,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to login"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.tokens?.access_token;
    await authService.logout(token);
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
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
        state.error = null;
      });
  },
});

export const { clearError, setUser, setTokens } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectTokens = (state: RootState) => state.auth.tokens;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
