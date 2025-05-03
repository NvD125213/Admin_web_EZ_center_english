export const EXAM_API = {
  GET_ALL: "/exam",
  GET_BY_ID: (id: number | string) => `/exam/${id}`,
  CREATE: "/exam",
  UPDATE: (id: number) => `/exam/${id}`,
  DELETE: (id: number) => `/exam/${id}`,
  GET_EXAMS_BY_SUBJECT: (id: number) => `/exam/get-exams-by-subject/${id}`,
};
