import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useGetStudentByClassMutation,
  useRegisterClassForStudentMutation,
  useGetClassByIdQuery,
} from "../../../services/classServices";
import { useGetStaffQuery } from "../../../services/staffServices";
import BaseTable, {
  BaseTableState,
  DefaultTableState,
  HeaderTable,
} from "../../../components/common/BaseTable";
import {
  Box,
  Typography,
  Chip,
  Button,
  Modal,
  TextField,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi as viLocale } from "date-fns/locale";
import { useSocket } from "../../../context/SocketContext";

interface StudentType {
  id: number;
  class_id: number;
  student_id: number;
  create_at: string;
  update_at: string;
  deleted_at: string | null;
  student: {
    id: number;
    user_id: number;
    birth: string;
    state: string;
    city: string;
    zip_code: string;
    street: string;
    name: string;
    email: string;
    phone: string;
    create_at: string;
    update_at: string;
    deleted_at: string | null;
  };
  payment_status: string;
  payment_details: {
    id: number;
    status: string;
    payment_date: string;
    amount: string;
    payment_method: string;
    student_id: number;
  } | null;
}

interface RegisterFormData {
  user_email: string;
  user_password: string;
  user_name: string;
  user_phone: string;
  name: string;
  email: string;
  phone: string;
  birth: Date;
  state: string;
  city: string;
  zip_code: string;
  street: string;
  staff_id: number;
  payment_method: string;
}

const StudentClass = () => {
  const { id } = useParams();
  const { notifications } = useSocket();
  const [tableState, setTableState] =
    useState<BaseTableState>(DefaultTableState);
  const [getStudents, { data, isLoading }] = useGetStudentByClassMutation();
  const [registerStudent, { isLoading: isRegistering }] =
    useRegisterClassForStudentMutation();
  const { data: classData } = useGetClassByIdQuery(Number(id), { skip: !id });
  const { data: staffData } = useGetStaffQuery({ limit: 100 });
  const [students, setStudents] = useState<StudentType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      user_email: "",
      user_password: "",
      user_name: "",
      user_phone: "",
      name: "",
      email: "",
      phone: "",
      birth: new Date(),
      state: "",
      city: "",
      zip_code: "",
      street: "",
      staff_id: 0,
      payment_method: "BANKING",
    },
  });

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    let timeoutId: number | null = null;
    if (error || success) {
      timeoutId = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error, success]);

  useEffect(() => {
    if (id) {
      getStudents(Number(id));
    }
  }, [id, getStudents]);

  useEffect(() => {
    if (data) {
      setStudents(data.data);
    }
  }, [data]);

  // Listen for payment updates
  useEffect(() => {
    const paymentUpdate = notifications.find(
      (n) => !n.read && n.title.includes("Thanh toán")
    );
    if (paymentUpdate) {
      // Refresh student list when there's a new payment notification
      getStudents(Number(id));
    }
  }, [notifications, id, getStudents]);

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "warning";
      case "COMPLETED":
        return "success";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const columns: HeaderTable[] = [
    {
      key: "name",
      name: "Họ và tên",
      row: (_: any, rowData: StudentType) => rowData.student.name,
    },
    {
      key: "email",
      name: "Email",
      row: (_: any, rowData: StudentType) => rowData.student.email,
    },
    {
      key: "phone",
      name: "Số điện thoại",
      row: (_: any, rowData: StudentType) => rowData.student.phone,
    },
    {
      key: "birth",
      name: "Ngày sinh",
      row: (_: any, rowData: StudentType) => formatDate(rowData.student.birth),
    },
    {
      key: "address",
      name: "Địa chỉ",
      row: (_: any, rowData: StudentType) => {
        const {
          street = "",
          city = "",
          state = "",
          zip_code = "",
        } = rowData.student;
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2">{street || "-"}</Typography>
            <Typography variant="body2">{`${city || "-"}, ${
              state || "-"
            }`}</Typography>
            <Typography variant="body2">{zip_code || "-"}</Typography>
          </Box>
        );
      },
    },
    {
      key: "payment_status",
      name: "Trạng thái thanh toán",
      row: (_: any, rowData: StudentType) => {
        const status = rowData.payment_status;
        return (
          <Chip
            label={
              status === "COMPLETED"
                ? "Đã thanh toán"
                : status === "PENDING"
                ? "Chờ thanh toán"
                : "Thanh toán thất bại"
            }
            color={getPaymentStatusColor(status)}
            size="small"
          />
        );
      },
    },
    {
      key: "payment_details",
      name: "Chi tiết thanh toán",
      row: (_: any, rowData: StudentType) => {
        if (!rowData.payment_details) return "-";
        const payment = rowData.payment_details;
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2">
              {formatCurrency(Number(payment.amount))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {payment.payment_method === "BANKING"
                ? "Chuyển khoản"
                : "Tiền mặt"}
            </Typography>
            {payment.payment_date && (
              <Typography variant="caption" color="text.secondary">
                {formatDate(payment.payment_date)}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: "enrollment_date",
      name: "Ngày đăng ký",
      row: (_: any, rowData: StudentType) => formatDate(rowData.create_at),
    },
  ];

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      setError(null);
      setSuccess(null);

      await registerStudent({
        class_id: Number(id),
        staff_id: formData.staff_id,
        course_id: classData?.data.course_id || 0,
        payment_method: formData.payment_method,
        student: {
          user_email: formData.user_email,
          user_password: formData.user_password,
          user_name: formData.user_name,
          user_phone: formData.user_phone,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birth: formData.birth.toISOString().split("T")[0],
          state: formData.state,
          city: formData.city,
          zip_code: formData.zip_code,
          street: formData.street,
        },
      }).unwrap();

      setSuccess(
        "Đăng ký học viên thành công! Vui lòng kiểm tra email để thanh toán."
      );
      setOpenModal(false);
      reset();
      getStudents(Number(id)); // Refresh student list
    } catch (err: any) {
      setError(err.data?.message || "Có lỗi xảy ra khi đăng ký học viên");
    }
  };

  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    maxHeight: "90vh",
    overflow: "auto",
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Danh sách học viên" />
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenModal(true)}>
            Thêm học viên
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <BaseTable
          columns={columns}
          data={students}
          tableState={tableState}
          onTableStateChange={setTableState}
          count={data?.total || 0}
          isPending={isLoading}
        />

        <Modal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            reset();
            setError(null);
          }}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
              Đăng ký học viên mới
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                }}>
                <Box sx={{ gridColumn: "span 2" }}>
                  <FormControl fullWidth error={!!errors.staff_id}>
                    <InputLabel>Nhân viên đăng ký</InputLabel>
                    <Controller
                      name="staff_id"
                      control={control}
                      rules={{ required: "Vui lòng chọn nhân viên" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Nhân viên đăng ký"
                          error={!!errors.staff_id}>
                          {staffData?.data.map((staff) => (
                            <MenuItem key={staff.id} value={staff.id}>
                              {staff.name} - {staff.email}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.staff_id && (
                      <Typography color="error" variant="caption">
                        {errors.staff_id.message}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box sx={{ gridColumn: "span 2" }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Thông tin học viên
                  </Typography>
                </Box>

                <Box>
                  <Controller
                    name="user_name"
                    control={control}
                    rules={{ required: "Vui lòng nhập tên tài khoản" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tên tài khoản"
                        error={!!errors.user_name}
                        helperText={errors.user_name?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="user_email"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập email",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email không hợp lệ",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email"
                        error={!!errors.user_email}
                        helperText={errors.user_email?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="user_phone"
                    control={control}
                    rules={{ required: "Vui lòng nhập số điện thoại" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Số điện thoại"
                        error={!!errors.user_phone}
                        helperText={errors.user_phone?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="user_password"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập mật khẩu",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="password"
                        label="Mật khẩu"
                        error={!!errors.user_password}
                        helperText={errors.user_password?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Vui lòng nhập tên học viên" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tên học viên"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Vui lòng nhập email học viên",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email không hợp lệ",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email học viên"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Vui lòng nhập số điện thoại học viên" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Số điện thoại học viên"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={viLocale}>
                    <Controller
                      name="birth"
                      control={control}
                      rules={{ required: "Vui lòng chọn ngày sinh" }}
                      render={({ field }) => (
                        <DatePicker
                          label="Ngày sinh"
                          value={field.value}
                          onChange={(newValue) => field.onChange(newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.birth,
                              helperText: errors.birth?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Box>

                <Box sx={{ gridColumn: "span 2" }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                    Địa chỉ
                  </Typography>
                </Box>

                <Box>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: "Vui lòng nhập tỉnh/thành phố" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tỉnh/Thành phố"
                        error={!!errors.state}
                        helperText={errors.state?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: "Vui lòng nhập quận/huyện" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Quận/Huyện"
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="street"
                    control={control}
                    rules={{ required: "Vui lòng nhập địa chỉ" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Địa chỉ"
                        error={!!errors.street}
                        helperText={errors.street?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="zip_code"
                    control={control}
                    rules={{ required: "Vui lòng nhập mã bưu điện" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Mã bưu điện"
                        error={!!errors.zip_code}
                        helperText={errors.zip_code?.message}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ gridColumn: "span 2" }}>
                  <FormControl fullWidth error={!!errors.payment_method}>
                    <InputLabel>Phương thức thanh toán</InputLabel>
                    <Controller
                      name="payment_method"
                      control={control}
                      rules={{
                        required: "Vui lòng chọn phương thức thanh toán",
                      }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Phương thức thanh toán"
                          error={!!errors.payment_method}>
                          <MenuItem value="BANKING">
                            Chuyển khoản ngân hàng
                          </MenuItem>
                          <MenuItem value="CASH">Tiền mặt</MenuItem>
                        </Select>
                      )}
                    />
                    {errors.payment_method && (
                      <Typography color="error" variant="caption">
                        {errors.payment_method.message}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box
                  sx={{
                    gridColumn: "span 2",
                    mt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                  }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOpenModal(false);
                      reset();
                      setError(null);
                    }}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isRegistering}>
                    {isRegistering ? "Đang xử lý..." : "Đăng ký"}
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default StudentClass;
