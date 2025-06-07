import axios from "axios";
import Cookies from "js-cookie";
import { store } from "../stores";
import { setCredentials, logout } from "../stores/auth/authSlice";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/",
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi đăng nhập
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu là lỗi đăng nhập (không phải refresh token)
      if (!originalRequest.url?.includes("refresh-token")) {
        return Promise.reject({
          response: {
            data: {
              message: "Email hoặc mật khẩu không đúng",
            },
          },
        });
      }

      // Xử lý refresh token
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          "http://localhost:3000/api/auth/refresh-token",
          {
            refreshToken: Cookies.get("refreshToken"),
          }
        );

        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject({
            response: {
              data: {
                message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
              },
            },
          });
        }
        store.dispatch(
          setCredentials({
            accessToken: data.access_token,
            refreshToken,
          })
        );

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject({
          response: {
            data: {
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            },
          },
        });
      }
    }

    // Xử lý các lỗi khác
    return Promise.reject({
      response: {
        data: {
          error:
            error.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại.",
        },
      },
    });
  }
);
