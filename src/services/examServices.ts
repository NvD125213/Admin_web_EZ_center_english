import { axiosInstance } from "../utils/http";
import { ExamType } from "../types";
import { EXAM_API } from "../constants";
export const examServices = {
  get: async (
    options: { all?: boolean; page?: number; limit?: number } = {}
  ) => {
    const params: any = {};

    if (options.all) {
      params.all = true;
    } else {
      params.page = options.page || 1;
      params.limit = options.limit || 10;
    }

    const response = await axiosInstance.get("/exam", { params });
    return response.data;
  },
  create: async (data: ExamType) => {
    const res = await axiosInstance.post("/exam", data);
    return res;
  },
  update: async (data: ExamType) => {
    const res = await axiosInstance.put(`/exam/${data.id}`, data);
    return res;
  },
  delete: async (id: any) => {
    const res = await axiosInstance.delete(`/exam/${id}`);
    return res;
  },

  getExamsBySubject: async (id: any) => {
    const res = await axiosInstance.get(EXAM_API.GET_EXAMS_BY_SUBJECT(id));
    return res;
  },
};
