import Cookies from "js-cookie";

export const getAccessToken = () => {
  return Cookies.get("accessToken");
};

export const getRefreshToken = () => {
  return Cookies.get("refreshToken");
};

export const setAccessToken = (token: string) => {
  Cookies.set("accessToken", token);
};

export const setRefreshToken = (token: string) => {
  Cookies.set("refreshToken", token);
};

export const removeAccessToken = () => {
  Cookies.remove("accessToken");
};

export const removeRefreshToken = () => {
  Cookies.remove("refreshToken");
};
