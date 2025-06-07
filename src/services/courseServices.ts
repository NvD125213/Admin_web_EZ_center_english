// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Types
export interface Course {
  id: number;
  menu_id: number;
  lessons: number;
  term: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  price: number;
  currency: string;
  description: string;
  create_at: string;
  update_at: string;
  deleted_at: string | null;
  menu?: {
    id: number;
    name: string;
    // thêm các trường khác nếu cần
  };
}

export interface CourseListResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "price" | "lessons" | "term";
  sort_order?: "asc" | "desc";
  search?: string;
}

export interface CreateCourseRequest {
  menu_id: number;
  lessons: number;
  term: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  price: number;
  currency: string;
  description: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Course"],
  endpoints: (builder) => ({
    // Get list of courses
    getCourses: builder.query<CourseListResponse, CourseQueryParams>({
      query: (params) => ({
        url: "/course",
        method: "GET",
        params,
      }),
      providesTags: ["Course"],
    }),

    // Get single course by ID
    getCourseById: builder.query<Course, number>({
      query: (id) => ({
        url: `/course/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    // Create new course
    createCourse: builder.mutation<Course, CreateCourseRequest>({
      query: (data) => ({
        url: "/course",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),

    // Update course
    updateCourse: builder.mutation<
      Course,
      { id: number; data: UpdateCourseRequest }
    >({
      query: ({ id, data }) => ({
        url: `/course/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        "Course",
      ],
    }),

    // Soft delete course
    deleteCourse: builder.mutation<{ message: string; data: Course }, number>({
      query: (id) => ({
        url: `/course/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
