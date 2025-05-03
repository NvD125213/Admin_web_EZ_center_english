import { axiosInstance } from "../utils/http";
import { SubjectType } from "../types/subject";
export const subjectServices = {
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

    const response = await axiosInstance.get("/subject", { params });
    return response.data;
  },
  create: async (data: SubjectType) => {
    const res = await axiosInstance.post("/subject", data);
    return res;
  },
  update: async (data: SubjectType) => {
    const res = await axiosInstance.put(`/subject/${data.id}`, data);
    return res;
  },
  delete: async (id: any) => {
    const res = await axiosInstance.delete(`/subject/${id}`);
    return res;
  },
};
