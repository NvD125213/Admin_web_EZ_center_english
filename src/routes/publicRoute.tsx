import { Navigate, Outlet } from "react-router";
import Cookies from "js-cookie";

interface PublicRouteProps {
  redirectPath?: string;
}

export const PublicRoute = ({ redirectPath = "/" }: PublicRouteProps) => {
  const accessToken = Cookies.get("access_token");

  // Nếu đã đăng nhập → không cho vào login/signup nữa, redirect về home
  if (accessToken) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
