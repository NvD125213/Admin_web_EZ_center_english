// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const statisticalApi = createApi({
  reducerPath: "statisticalApi",
  baseQuery: baseQueryWithReauth(),
  endpoints: (builder) => ({
    getAllUserStatistical: builder.query<any, void>({
      query: () => ({
        url: "/statistical/get-all-user",
        method: "GET",
      }),
    }),
    getAllUserByMonth: builder.query<any, void>({
      query: () => ({
        url: "/statistical/get-all-user-by-month",
        method: "GET",
      }),
    }),
    getPaymentStatistical: builder.query<any, void>({
      query: () => ({
        url: "/statistical/get-payment-statistical",
        method: "GET",
      }),
    }),
    getPaymentStatisticalYear: builder.query<any, void>({
      query: () => ({
        url: "/statistical/get-payment-statistical-year",
        method: "GET",
      }),
    }),
    getCoursedFavorite: builder.query<any, void>({
      query: () => ({
        url: "/statistical/get-coursed-favorite",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllUserStatisticalQuery,
  useGetAllUserByMonthQuery,
  useGetPaymentStatisticalQuery,
  useGetPaymentStatisticalYearQuery,
  useGetCoursedFavoriteQuery,
} = statisticalApi;
