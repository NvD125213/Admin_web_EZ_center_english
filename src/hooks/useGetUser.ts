// hooks/useMe.ts
import { useQuery } from "@tanstack/react-query";
import { authServices } from "../services/authServices";
import Cookies from "js-cookie";

export const useGetUser = () => {
  const accessToken = Cookies.get("access_token");

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await authServices.fetchUser();
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!accessToken,
    keepPreviousData: true,
  });
};
