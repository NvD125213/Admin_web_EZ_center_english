import { axiosInstance } from "../utils/http";
import { PART_API } from "../constants";
export const partServices = {
  get: async () => {
    const response = await axiosInstance.get(PART_API.GET_ALL);
    return response.data;
  },
};
