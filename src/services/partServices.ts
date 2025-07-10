import { axiosInstance } from "../utils/http";
import { PART_API } from "../constants";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { PartType } from "../types/part";

export const partApi = createApi({
  reducerPath: "partApi",
  baseQuery: baseQueryWithReauth(),
  endpoints: (builder) => ({
    createPart: builder.mutation<any, any>({
      query: (data) => ({
        url: "/part",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const partServices = {
  get: async () => {
    const response = await axiosInstance.get(PART_API.GET_ALL);
    return response.data;
  },
};
export const { useCreatePartMutation } = partApi;
