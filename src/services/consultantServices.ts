// services/courseApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

interface Menu {
  id: number;
  name: string;
}

interface Course {
  id: number;
  menu: Menu;
}

interface Consultation {
  id: number;
  name: string;
  email: string;
  phone: string;
  course_id: number;
  create_at: string;
  course: Course;
}

interface ConsultationResponse {
  data: Consultation[];
}

const consultantApi = createApi({
  reducerPath: "consultantApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Consultant"],
  endpoints: (builder) => ({
    getConsultations: builder.query<ConsultationResponse, void>({
      query: () => ({
        url: "/consultation",
        method: "GET",
      }),
      providesTags: ["Consultant"],
    }),
  }),
});

export const { useGetConsultationsQuery } = consultantApi;
export default consultantApi;
