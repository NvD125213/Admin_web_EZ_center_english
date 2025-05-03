export const SUBJECT_API = {
  GET_ALL: "/subject",
  GET_BY_ID: (id: number | string) => `/subject/${id}`,
  CREATE: "/subject",
  UPDATE: (id: number | string) => `/subject/${id}`,
  DELETE: (id: number | string) => `/subject/${id}`,
};
