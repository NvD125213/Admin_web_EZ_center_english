import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./index";
import Cookies from "js-cookie";

export const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api",
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    const token = (getState() as RootState).auth.accessToken;

    // If not in Redux state, try to get from cookies
    const accessToken = token || Cookies.get("access_token");

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});
