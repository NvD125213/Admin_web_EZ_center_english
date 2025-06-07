import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { CiFacebook } from "react-icons/ci";
import toast from "react-hot-toast";
import * as yup from "yup";
import { Modal, Box, Typography, TextField } from "@mui/material";
import {
  useLoginMutation,
  useVerifyOtpMutation,
  useFetchUserQuery,
} from "../../stores/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials, setUser } from "../../stores/auth/authSlice";
import { UserType } from "../../types";
import Cookies from "js-cookie";

interface FormErrors {
  email?: string;
  password?: string;
  otp?: string;
}

// Schema validation
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("Vui lòng nhập mã OTP")
    .matches(/^\d{4}$/, "Mã OTP phải có 4 chữ số"),
});

export default function SignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const { data: userData, refetch } = useFetchUserQuery();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      await loginSchema.validate(data, { abortEarly: false });
      const response = await login(data).unwrap();

      if (response.status === "PENDING") {
        setUserId(response.data.id);
        setOpenModal(true);
      }
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        setErrors(validationErrors);
      } else {
        toast.error(
          err.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng"
        );
      }
    }
  };

  const handleOtpSubmit = async () => {
    try {
      await otpSchema.validate({ otp }, { abortEarly: false });
      if (!userId) throw new Error("User ID không hợp lệ");
      const response = await verifyOtp({ userId, otp }).unwrap();

      if (
        response.status === "VERIFIED" &&
        response.access_token &&
        response.refresh_token
      ) {
        // Set cookies first
        Cookies.set("accessToken", response.access_token);
        Cookies.set("refreshToken", response.refresh_token);

        // Then update Redux store
        dispatch(
          setCredentials({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          })
        );

        // Wait for user data to be fetched before navigating
        const { data: userData } = await refetch();
        if (userData) {
          dispatch(setUser(userData as UserType));
          setOpenModal(false); // Close the modal
          navigate("/", { replace: true });
        }
      } else {
        throw new Error("Không nhận được token sau khi xác thực OTP");
      }
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Mã OTP không hợp lệ");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập email và mật khẩu để đăng nhập!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Đăng nhập với Google
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <CiFacebook size={32} />
                Đăng nhập với Facebook
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Hoặc
                </span>
              </div>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    name="email"
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      error={!!errors.password}
                      hint={errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Lưu mật khẩu
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Không có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="otp-modal-title"
        aria-describedby="otp-modal-description">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}>
          <Typography
            id="otp-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}>
            Xác thực OTP
          </Typography>
          <Typography
            id="otp-modal-description"
            sx={{ mb: 3, color: "text.secondary" }}>
            Vui lòng nhập mã OTP đã được gửi đến email của bạn
          </Typography>
          <div className="space-y-4">
            <TextField
              fullWidth
              name="otp"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!errors.otp}
              helperText={errors.otp}
              sx={{ mb: 3 }}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenModal(false)}>
                Hủy
              </Button>
              <Button size="sm" onClick={handleOtpSubmit}>
                Xác nhận
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
