import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

// Types
export interface Blog {
  id: number;
  title: string;
  content: string;
  menu_id: number;
  status: "Open" | "Close";
  user_id: number;
  description: string;
  image_title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  menu: {
    id: number;
    name: string;
  };
}

export interface BlogListResponse {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "title" | "menu_id" | "status" | "user_id";
  sort_order?: "asc" | "desc";
  search?: string;
  menu_id?: number;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  menu_id: number;
  status: "Open" | "Close";
  user_id: number;
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {}

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    // Get list of blogs
    getBlogs: builder.query<BlogListResponse, BlogQueryParams>({
      query: (params) => ({
        url: "/blog",
        method: "GET",
        params,
      }),
      providesTags: ["Blog"],
    }),

    // Get single blog by ID
    getBlogById: builder.query<Blog, number>({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    // Create new blog
    createBlog: builder.mutation<Blog, CreateBlogRequest>({
      query: (data) => ({
        url: "/blog",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),

    // Update blog
    updateBlog: builder.mutation<Blog, { id: number; data: UpdateBlogRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/blog/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Blog", id },
          "Blog",
        ],
      }
    ),

    // Delete blog
    deleteBlog: builder.mutation<{ message: string; data: Blog }, number>({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
