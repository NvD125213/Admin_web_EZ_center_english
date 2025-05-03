// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { UserType } from "../../types";
import { authApi } from "./authApi";

interface AuthState {
  user: UserType | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      Cookies.set("access_token", action.payload.accessToken);
      Cookies.set("refresh_token", action.payload.refreshToken);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.getCurrentUser.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.loading = false;
        }
      )
      .addMatcher(authApi.endpoints.getCurrentUser.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.getCurrentUser.matchRejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;

export default authSlice.reducer;
