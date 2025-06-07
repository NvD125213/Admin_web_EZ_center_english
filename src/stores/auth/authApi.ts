import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";
import { setCredentials } from "./authSlice";
import Cookies from "js-cookie";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  access_token: string;
  refresh_token: string;
  data: {
    id: number;
    expiredAt: string;
  };
}

interface UserResponse {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  role: number;
}

interface RefreshTokenRequest {
  refresh_token: string;
}

interface VerifyOtpRequest {
  otp: string;
  userId: number;
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
          setAuthCookies(data.access_token, data.refresh_token);
          dispatch(
            setCredentials({
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
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
          dispatch(
            setCredentials({
              accessToken: data.access_token,
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
