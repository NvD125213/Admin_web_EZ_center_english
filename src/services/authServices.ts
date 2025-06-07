import { axiosInstance } from "../utils/http";
import { AUTH_API } from "../constants";
import { LoginType, AuthType } from "../types";
import { createApi } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { setCredentials } from "../stores/auth/authSlice";
import { baseQueryWithReauth } from "./baseQuery";

export const authServices = {
  login: async (data: LoginType) => {
    const res = axiosInstance.post(AUTH_API.LOGIN, data);
    return res;
  },
  fetchUser: async () => {
    const res = await axiosInstance.get("/auth/current-user");
    return res.data;
  },
  refreshToken: async (data: AuthType) => {
    const res = axiosInstance.post(AUTH_API.REFRESH_TOKEN, data.refresh_token);
    return res;
  },
  verifyOtp: async (data: any) => {
    const res = axiosInstance.post(AUTH_API.VERIFY_OTP, data);
    return res;
  },

  resendVerifyOtp: async () => {
    const res = axiosInstance.post(AUTH_API.VERIFY_OTP);
    return res;
  },

  logout: async (data: AuthType) => {
    const res = axiosInstance.post(AUTH_API.LOGOUT, data.refresh_token);
    return res;
  },
};

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  status: string;
  status_code: string;
  message: string;
  data: {
    id: number;
    access_token: string;
    refresh_token: string;
  };
}

interface UserResponse {
  status: string;
  status_code: string;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface RefreshTokenRequest {
  refresh_token: string;
}

interface VerifyOtpRequest {
  otp: string;
}

const setAuthCookies = (accessToken: string, refreshToken?: string) => {
  Cookies.set("accessToken", accessToken);
  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken);
  }
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAuthCookies(data.data.access_token, data.data.refresh_token);
          dispatch(
            setCredentials({
              accessToken: data.data.access_token,
              refreshToken: data.data.refresh_token,
            })
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(setCredentials({ accessToken: "", refreshToken: "" }));
        } catch (error) {
          console.log(error);
          dispatch(setCredentials({ accessToken: "", refreshToken: "" }));
        }
      },
    }),

    fetchUser: builder.query<UserResponse, void>({
      query: () => ({
        url: "/auth/current-user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    refreshToken: builder.mutation<LoginResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body: data.refresh_token,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAuthCookies(data.data.access_token, data.data.refresh_token);
          dispatch(
            setCredentials({
              accessToken: data.data.access_token,
              refreshToken: data.data.refresh_token,
            })
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),

    verifyOtp: builder.mutation<any, VerifyOtpRequest>({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    resendVerifyOtp: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/verify-otp",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useFetchUserQuery,
  useRefreshTokenMutation,
  useVerifyOtpMutation,
  useResendVerifyOtpMutation,
} = authApi;
