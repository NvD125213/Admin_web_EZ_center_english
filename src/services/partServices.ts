import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { PartType } from "../types/part";

export const partApi = createApi({
  reducerPath: "partApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Part"], // cần khai báo nếu muốn dùng providesTags / invalidatesTags
  endpoints: (builder) => ({
    createPart: builder.mutation<PartType, Partial<PartType>>({
      query: (data) => ({
        url: "/part",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Part"],
    }),
    getParts: builder.query<PartType[], void>({
      query: () => ({
        url: "/part",
        method: "GET",
      }),
      providesTags: ["Part"],
    }),
  }),
});

// Hooks auto-generated
export const { useCreatePartMutation, useGetPartsQuery } = partApi;
