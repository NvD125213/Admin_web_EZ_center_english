import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import toast from "react-hot-toast";
import * as yup from "yup";
import { Modal, Box, Typography, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
          dispatch(setUser(userData as unknown as UserType));
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

  const handleCloseModal = () => {
    setOpenModal(false);
    setOtp(""); // Reset OTP when closing
    setErrors({}); // Reset errors when closing
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

                <div>
                  <Button className="w-full" size="sm" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        open={openModal}
        onClose={(event, reason) => {
          // Chỉ cho phép đóng khi reason là 'escapeKeyDown' hoặc không có reason (từ nút close)
          // Không cho phép đóng khi click backdrop
          if (reason !== "backdropClick") {
            handleCloseModal();
          }
        }}
        disableEscapeKeyDown={false} // Vẫn cho phép đóng bằng ESC key
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
            outline: "none", // Remove default focus outline
          }}>
          {/* Close button */}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "grey.500",
            }}>
            <CloseIcon />
          </IconButton>

          <Typography
            id="otp-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2, pr: 4 }}>
            {" "}
            {/* Add right padding to avoid overlap with close button */}
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
              autoFocus // Auto focus on OTP input when modal opens
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={handleCloseModal}>
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
