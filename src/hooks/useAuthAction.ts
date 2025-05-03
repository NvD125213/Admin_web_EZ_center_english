import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authServices } from "../services/authServices";
import { LoginType, AuthType } from "../types";
import Cookie from "js-cookie";

interface VerifyOtpType {
  otp: string;
  userId: number;
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: LoginType) => authServices.login(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  return mutation;
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: AuthType) => authServices.refreshToken(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });

  return mutation;
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOtpType) => authServices.verifyOtp(data),
    onSuccess: (data) => {
      Cookie.set("accessToken", data.data.access_token);
      Cookie.set("refreshToken", data.data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useResendVerifyOtp = () => {
  return useMutation({
    mutationFn: authServices.resendVerifyOtp,
  });
};
