import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SubjectType } from "../types/subject";
import { baseQueryWithReauth } from "./baseQuery";

export interface SubjectResponse {
  data: SubjectType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SubjectQueryParams {
  page?: number;
  limit?: number;
  all?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
}

interface CreateSubjectRequest {
  name: string;
  [key: string]: any;
}

interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {}

export const subjectApi = createApi({
  reducerPath: "subjectApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Subject"],
  endpoints: (builder) => ({
    getSubjects: builder.query<SubjectResponse, SubjectQueryParams>({
      query: (params) => ({
        url: "/subject",
        method: "GET",
        params,
      }),
      providesTags: ["Subject"],
    }),
    getSubjectById: builder.query<SubjectType, number>({
      query: (id) => ({
        url: `/subject/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Subject", id }],
    }),
    createSubject: builder.mutation<SubjectType, CreateSubjectRequest>({
      query: (data) => ({
        url: "/subject",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subject"],
    }),
    updateSubject: builder.mutation<
      SubjectType,
      { id: number; data: UpdateSubjectRequest }
    >({
      query: ({ id, data }) => ({
        url: `/subject/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subject", id },
        "Subject",
      ],
    }),
    deleteSubject: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subject"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;
