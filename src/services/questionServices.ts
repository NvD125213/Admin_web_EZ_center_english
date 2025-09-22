import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const questionApi = createApi({
  reducerPath: "questionApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Question"],
  endpoints: (builder) => ({
    // Lấy danh sách câu hỏi theo examId + partId
    getQuestions: builder.query<
      any, // dữ liệu trả về kiểu any
      {
        examId: number | string;
        partId: number | string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ examId, partId, page = 1, limit = 10 }) => ({
        url: `/question/getQuestionByPartAndExam`,
        params: { exam_id: examId, part_id: partId, page, limit },
      }),
      providesTags: ["Question"],
    }),

    // Tạo mới câu hỏi
    createQuestion: builder.mutation<
      any,
      { examId: string | null; partId: string | null; data: FormData }
    >({
      query: ({ examId, partId, data }) => ({
        url: `/question/createQuestion?exam_id=${examId}&part_id=${partId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Question"],
    }),

    // Cập nhật câu hỏi
    updateQuestion: builder.mutation<
      any,
      {
        examId: string | null;
        partId: string | null;
        questionId: number;
        data: FormData;
      }
    >({
      query: ({ examId, partId, questionId, data }) => ({
        url: `/question/update?exam_id=${examId}&part_id=${partId}&question_id=${questionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Question"],
    }),

    // Xóa câu hỏi
    deleteQuestion: builder.mutation<any, number>({
      query: (questionId) => ({
        url: `/question/delete?question_id=${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Question"],
    }),

    // Update nhóm câu hỏi
    updateGroupQuestion: builder.mutation<
      any,
      {
        examId: string | null;
        partId: string | null;
        groupId: number;
        data: FormData;
      }
    >({
      query: ({ examId, partId, groupId, data }) => ({
        url: `/question/updateGroup?exam_id=${examId}&part_id=${partId}&group_id=${groupId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Question"],
    }),

    // Upload Excel
    uploadExcel: builder.mutation<
      any,
      { file: { detailQuestions: any[]; examAndSubject: any[] } }
    >({
      query: (data) => ({
        url: `/question/uploadExcel`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Question"],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useUploadExcelMutation,
  useUpdateGroupQuestionMutation,
} = questionApi;
