import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import { RootState } from "../stores";

interface ProtectedRouteProps {
  children: React.ReactNode;
  isPublic?: boolean;
}

export default function ProtectedRoute({
  children,
  isPublic = false,
}: ProtectedRouteProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000); // Luôn loading ít nhất 1 giây

    return () => clearTimeout(timer);
  }, []);

  // Đang loading user hoặc chưa đủ 1 giây => show spinner
  if (user === undefined || showLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh">
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  // Nếu user đã login mà vào trang public => redirect về home
  if (user && isPublic) {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa login và cố vào route private => redirect về signin
  if (!user && !isPublic) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Ngược lại, cho render children
  return children;
}
