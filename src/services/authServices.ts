import { axiosInstance } from "../utils/http";
import { AUTH_API } from "../constants";
import { LoginType, AuthType } from "../types";

export const authServices = {
  login: async (data: LoginType) => {
    const res = axiosInstance.post(AUTH_API.LOGIN, data);
    return res;
  },
  fetchUser: async () => {
    const res = await axiosInstance.get("/auth/current-user");
    return res.data;
  },
  refreshToken: async (data: AuthType) => {
    const res = axiosInstance.post(AUTH_API.REFRESH_TOKEN, data.refresh_token);
    return res;
  },
  verifyOtp: async (data: any) => {
    const res = axiosInstance.post(AUTH_API.VERIFY_OTP, data);
    return res;
  },

  resendVerifyOtp: async () => {
    const res = axiosInstance.post(AUTH_API.VERIFY_OTP);
    return res;
  },

  logout: async (data: AuthType) => {
    const res = axiosInstance.post(AUTH_API.LOGOUT, data.refresh_token);
    return res;
  },
};
