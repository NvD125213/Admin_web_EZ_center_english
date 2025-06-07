// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Types
export interface Staff {
  id: number;
  user_id: number;
  photo: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  create_at: string;
  update_at: string;
  deleted_at: string;
  password: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
    googleId: string | null;
    is_active: boolean;
    role: number;
    create_at: string;
    update_at: string;
  };
}

export interface StaffListResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "name" | "email";
  sort_order?: "asc" | "desc";
  search?: string;
}

export interface CreateStaffRequest {
  position: string;
  photo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateStaffRequest {
  description?: string;
  photo?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Staff"],
  endpoints: (builder) => ({
    // Get list of courses
    getStaff: builder.query<StaffListResponse, StaffQueryParams>({
      query: (params) => ({
        url: "/staff",
        method: "GET",
        params,
      }),
      providesTags: ["Staff"],
    }),

    // Get single course by ID
    getStaffById: builder.query<Staff, number>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Staff", id }],
    }),

    // Create new course
    createStaff: builder.mutation<Staff, CreateStaffRequest>({
      query: (data) => ({
        url: "/staff",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),

    // Update course
    updateStaff: builder.mutation<
      Staff,
      { id: number; data: UpdateStaffRequest }
    >({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Staff", id },
        "Staff",
      ],
    }),

    // Soft delete course
    deleteStaff: builder.mutation<{ message: string; data: Staff }, number>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetStaffByIdQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;
