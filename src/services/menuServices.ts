import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface Menu {
  id: number;
  name: string;
  sort?: number;
  status: "Open" | "Close";
  parent_id?: number;
  parent?: Menu;
  children?: Menu[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface MenuResponse {
  data: Menu[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MenuQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "create_at" | "sort" | "name";
  sort_order?: "asc" | "desc";
  search?: string;
  status?: "Open" | "Close";
}

interface CreateMenuRequest {
  name: string;
  sort?: number;
  status: "Open" | "Close";
  parent_id?: number;
}

interface UpdateMenuRequest extends Partial<CreateMenuRequest> {}

interface ReorderMenuRequest {
  id: number;
  sort: number;
}

export const menuApi = createApi({
  reducerPath: "menuApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Menu"],
  endpoints: (builder) => ({
    getMenus: builder.query<MenuResponse, MenuQueryParams>({
      query: (params) => ({
        url: "/menu",
        method: "GET",
        params,
      }),
      providesTags: ["Menu"],
    }),
    getMenuById: builder.query<Menu, number>({
      query: (id) => ({
        url: `/menu/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Menu", id }],
    }),
    createMenu: builder.mutation<Menu, CreateMenuRequest>({
      query: (data) => ({
        url: "/menu",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Menu"],
    }),
    updateMenu: builder.mutation<Menu, { id: number; data: UpdateMenuRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/menu/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Menu", id },
          "Menu",
        ],
      }
    ),
    deleteMenu: builder.mutation<{ message: string; data: Menu }, number>({
      query: (id) => ({
        url: `/menu/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),
    reorderMenus: builder.mutation<{ message: string }, ReorderMenuRequest[]>({
      query: (data) => ({
        url: "/menu/reorder",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Menu"],
    }),
  }),
});

export const {
  useGetMenusQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useReorderMenusMutation,
} = menuApi;
