// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Types
export interface Teacher {
  id: number;
  user_id: number;
  description: string;
  photo: string;
  name: string;
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

export interface TeacherListResponse {
  data: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeacherQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "name" | "email";
  sort_order?: "asc" | "desc";
  search?: string;
}

export interface CreateTeacherRequest {
  description: string;
  photo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateTeacherRequest {
  description?: string;
  photo?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Teacher"],
  endpoints: (builder) => ({
    // Get list of courses
    getTeacher: builder.query<TeacherListResponse, TeacherQueryParams>({
      query: (params) => ({
        url: "/teacher",
        method: "GET",
        params,
      }),
      providesTags: ["Teacher"],
    }),

    // Get single course by ID
    getTeacherById: builder.query<Teacher, number>({
      query: (id) => ({
        url: `/teacher/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Teacher", id }],
    }),

    // Create new course
    createTeacher: builder.mutation<Teacher, CreateTeacherRequest>({
      query: (data) => ({
        url: "/teacher",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),

    // Update course
    updateTeacher: builder.mutation<
      Teacher,
      { id: number; data: UpdateTeacherRequest }
    >({
      query: ({ id, data }) => ({
        url: `/teacher/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teacher", id },
        "Teacher",
      ],
    }),

    // Soft delete course
    deleteTeacher: builder.mutation<{ message: string; data: Teacher }, number>(
      {
        query: (id) => ({
          url: `/teacher/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Teacher"],
      }
    ),
  }),
});

export const {
  useGetTeacherByIdQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;
