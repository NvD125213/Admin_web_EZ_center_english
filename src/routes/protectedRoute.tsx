import { Navigate, Outlet } from "react-router";
import Cookies from "js-cookie";
interface PrivateRouteProps {
  requiredRole?: string;
  redirectPath?: string;
}
export const PrivateRoute = ({
  redirectPath = "/signin",
}: PrivateRouteProps) => {
  const accessToken = Cookies.get("access_token");

  if (!accessToken) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
