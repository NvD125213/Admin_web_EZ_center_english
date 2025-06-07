import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../stores/auth/authSlice";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
} from "../utils/cookies";
import { axiosClient } from "./axios.service";
import { NavigateFunction } from "react-router-dom";

const baseQuery = fetchBaseQuery({
  baseUrl: axiosClient.defaults.baseURL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const rawBaseQuery = fetchBaseQuery({
  baseUrl: axiosClient.defaults.baseURL,
});

// Bạn cần truyền navigate function khi gọi API nếu muốn redirect
export const baseQueryWithReauth: (
  navigate?: NavigateFunction
) => BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError> =
  (navigate) => async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401 && getRefreshToken()) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh-token",
          method: "POST",
          body: {
            refreshToken: getRefreshToken(),
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
        api,
        extraOptions
      );

      const data = refreshResult.data as
        | { access_token: string; message: string }
        | { message: "Session expired" }
        | undefined;

      if (data && "access_token" in data) {
        const { access_token: newToken } = data;

        setAccessToken(newToken);
        api.dispatch(
          setCredentials({
            accessToken: newToken,
            refreshToken: getRefreshToken() ?? "",
          })
        );

        result = await baseQuery(args, api, extraOptions);
      } else {
        // Trường hợp "Session expired" hoặc refresh thất bại
        removeAccessToken();
        removeRefreshToken();
        api.dispatch(logout());

        if (data && "message" in data && data.message === "Session expired") {
          navigate?.("/signin");
        }
      }
    }

    return result;
  };
