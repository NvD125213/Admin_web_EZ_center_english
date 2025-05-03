import { axiosInstance } from "../utils/http";
import { QUESTION_API } from "../constants";

export const questionServices = {
  get: async (options: {
    all?: boolean;
    page?: number;
    limit?: number;
    examId: number | string;
    partId: number | string;
  }) => {
    const { examId, partId, page = 1, limit = 10 } = options;

    const response = await axiosInstance.get(
      QUESTION_API.GET_BY_EXAM_ID_AND_PART_ID(examId, partId, page, limit)
    );
    return response.data;
  },

  create: async (options: {
    examId: string | null;
    partId: string | null;
    data: FormData;
  }) => {
    const { examId, partId, data } = options;
    const response = await axiosInstance.post(
      `/question/createQuestion?exam_id=${examId}&part_id=${partId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  update: async (options: {
    examId: string | null;
    partId: string | null;
    questionId: number;
    data: FormData;
  }) => {
    const { examId, partId, questionId, data } = options;
    const response = await axiosInstance.put(
      `/question/update?exam_id=${examId}&part_id=${partId}&question_id=${questionId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  delete: async (questionId: number) => {
    const response = await axiosInstance.delete(
      `/question/delete?question_id=${questionId}`
    );
    return response.data;
  },
  uploadExcel: async (data: {
    file: {
      detailQuestions: any[];
      examAndSubject: any[];
    };
  }) => {
    const response = await axiosInstance.post(`/question/uploadExcel`, data);
    return response;
  },
};
