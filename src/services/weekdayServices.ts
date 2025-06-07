// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Types
export interface WeekdayType {
  id: number;
  week_day: number;
  start_time: string;
  address_id: number;
  hours: number;
  create_at: string;
  update_at: string;
  deleted_at: string | null;
  class_schedules?: any[];
}

export interface WeekdayTypeListResponse {
  data: WeekdayType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WeekdayByIDResponse {
  data: WeekdayType;
}

export interface WeekdayTypeQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "week_day" | "email" | "start_time";
  sort_order?: "asc" | "desc";
  search?: string;
}

export const weekdayApi = createApi({
  reducerPath: "weekdayApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Weekday"],
  endpoints: (builder) => ({
    // Get list of courses
    getWeekDayAll: builder.query<
      WeekdayTypeListResponse,
      WeekdayTypeQueryParams
    >({
      query: (params) => ({
        url: "/weekday",
        method: "GET",
        params,
      }),
      providesTags: ["Weekday"],
    }),

    // Get single course by ID
    getWeekDayById: builder.query<WeekdayByIDResponse, number>({
      query: (id) => ({
        url: `/weekday/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Weekday", id }],
    }),

    // Create new course
    createWeekday: builder.mutation<WeekdayType, any>({
      query: (data) => ({
        url: "/weekday",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Weekday"],
    }),

    // Update course
    updateWeekday: builder.mutation<WeekdayType, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/weekday/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Weekday", id },
        "Weekday",
      ],
    }),

    // Soft delete course
    deleteWeekday: builder.mutation<
      { message: string; data: WeekdayType },
      number
    >({
      query: (id) => ({
        url: `/weekday/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Weekday"],
    }),
  }),
});

export const {
  useGetWeekDayAllQuery,
  useGetWeekDayByIdQuery,
  useCreateWeekdayMutation,
  useUpdateWeekdayMutation,
  useDeleteWeekdayMutation,
} = weekdayApi;
