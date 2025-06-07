// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Types
export interface ClassWeekday {
  week_day: number;
  hours: number;
  start_time: string;
}

export interface ClassType {
  id: number;
  name: string;
  teacher_id: number;
  course_id: number;
  address_id: number;
  start_date: string;
  end_date: string;
  create_at: string;
  update_at: string;
  deleted_at: string | null;
  teacher?: {
    id: number;
    name: string;
  };
  course?: {
    id: number;
    menu?: {
      name: string;
    };
  };
  address?: {
    id: number;
    street: string;
    ward: string;
    district: string;
    province: string;
  };
  class_weekdays?: ClassWeekday[];
  class_schedules?: {
    weekday: ClassWeekday;
  }[];
}

export interface ClassDetailResponse {
  data: ClassType;
}

export interface ClassTypeListResponse {
  data: ClassType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClassTypeQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "name" | "start_date" | "end_date";
  sort_order?: "asc" | "desc";
  search?: string;
  teacher_id?: number;
}

export interface StaffType {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface StaffListResponse {
  data: StaffType[];
  total: number;
}

export const classApi = createApi({
  reducerPath: "classApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Classes"],
  endpoints: (builder) => ({
    // Get list of courses
    getClassAll: builder.query<ClassTypeListResponse, ClassTypeQueryParams>({
      query: (params) => ({
        url: "/class",
        method: "GET",
        params,
      }),
      providesTags: ["Classes"],
    }),

    // Get single course by ID
    getClassById: builder.query<ClassDetailResponse, number>({
      query: (id) => ({
        url: `/class/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Classes", id }],
    }),

    // Create new course
    createClass: builder.mutation<ClassType, any>({
      query: (data) => ({
        url: "/class",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Classes"],
    }),

    // Update course
    updateClass: builder.mutation<ClassType, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/class/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Classes", id },
        "Classes",
      ],
    }),

    // Soft delete course
    deleteClass: builder.mutation<{ message: string; data: ClassType }, number>(
      {
        query: (id) => ({
          url: `/class/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Classes"],
      }
    ),

    registerClassForStudent: builder.mutation({
      query: (data) => ({
        url: "/class/register-class",
        method: "POST",
        body: data,
      }),
    }),

    // Get students by ClassId
    getStudentByClass: builder.mutation({
      query: (id) => ({
        url: `/class/${id}/students`,
        method: "GET",
      }),
      invalidatesTags: ["Classes"],
    }),
  }),
});

export const {
  useGetClassAllQuery,
  useGetClassByIdQuery,
  useGetStudentByClassMutation,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useRegisterClassForStudentMutation,
} = classApi;
