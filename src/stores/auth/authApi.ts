import { createApi } from "@reduxjs/toolkit/query/react";
import { AUTH_API } from "../../constants";
import { baseQuery } from "../baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: AUTH_API.LOGIN,
        method: "POST",
        body,
      }),
    }),

    register: builder.mutation({
      query: (body) => ({
        url: AUTH_API.REGISTER,
        method: "POST",
        body,
      }),
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        url: AUTH_API.REFRESH_TOKEN,
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (body) => ({
        url: AUTH_API.VERIFY_OTP,
        method: "POST",
        body,
      }),
    }),

    getCurrentUser: builder.query<any, void>({
      query: () => ({
        url: AUTH_API.GET_CURRENT_USER,
        method: "GET",
      }),
    }),
    logout: builder.mutation({
      query: (body) => ({
        url: AUTH_API.LOGOUT,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyOtpMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
