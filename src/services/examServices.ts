import { ExamType } from "../types";
import { baseQueryWithReauth } from "./baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Exam"],
  endpoints: (builder) => ({
    getExams: builder.query<
      any,
      { page?: number; limit?: number; all?: boolean }
    >({
      query: (params) => ({
        url: "/exam",
        params,
      }),
      providesTags: (result) => [{ type: "Exam" }],
    }),

    createExam: builder.mutation<ExamType, ExamType>({
      query: (data) => ({
        url: "/exam",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Exam" }],
    }),

    updateExam: builder.mutation<ExamType, ExamType>({
      query: (data) => ({
        url: `/exam/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Exam" }],
    }),
    deleteExam: builder.mutation<any, number>({
      query: (id) => ({
        url: `/exam/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Exam" }],
    }),
    getExamsBySubject: builder.query<any, number>({
      query: (id) => ({
        url: `/exam/get-exams-by-subject/${id}`,
      }),
      providesTags: (result) => [{ type: "Exam" }],
    }),
  }),
});

// export const examServices = {
//   get: async (
//     options: { all?: boolean; page?: number; limit?: number } = {}
//   ) => {
//     const params: any = {};

//     if (options.all) {
//       params.all = true;
//     } else {
//       params.page = options.page || 1;
//       params.limit = options.limit || 10;
//     }

//     const response = await axiosInstance.get("/exam", { params });
//     return response.data;
//   },
//   create: async (data: ExamType) => {
//     const res = await axiosInstance.post("/exam", data);
//     return res;
//   },
//   update: async (data: ExamType) => {
//     const res = await axiosInstance.put(`/exam/${data.id}`, data);
//     return res;
//   },
//   delete: async (id: any) => {
//     const res = await axiosInstance.delete(`/exam/${id}`);
//     return res;
//   },

//   getExamsBySubject: async (id: any) => {
//     const res = await axiosInstance.get(EXAM_API.GET_EXAMS_BY_SUBJECT(id));
//     return res;
//   },
// };

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetExamsBySubjectQuery,
} = examApi;
