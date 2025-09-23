import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ExamType } from "../../../types";
import { useGetSubjectsQuery } from "../../../services/subjectServices";
import {
  useCreateExamMutation,
  useUpdateExamMutation,
} from "../../../services/examServices";

interface ExamModalProps {
  isOpen: boolean;
  data?: ExamType;
  onCloseModal: () => void;
  onSuccess: () => void;
}

const ExamAction: React.FC<ExamModalProps> = ({
  isOpen,
  data,
  onCloseModal,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExamType>({
    defaultValues: { name: "", subject_id: "1" },
  });

  const { data: subjectsData } = useGetSubjectsQuery({ all: true });
  const subjects = subjectsData?.data || [];

  const [errorDetail, setErrorDetail] = useState("");

  // RTK Query mutation hooks
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        subject_id: String(data.subject_id), // Giữ dạng string để match với Select value
      });
    } else {
      reset({ name: "", subject_id: "1" });
    }
  }, [data, reset]);

  const handleClose = () => {
    onCloseModal();
    reset({ name: "", subject_id: "1" });
    setErrorDetail("");
  };

  const sendRequest = async (formData: ExamType) => {
    try {
      // Debug: Log form data trước khi xử lý
      console.log("Form data nhận được:", formData);

      // Ensure subject_id is included and converted to number
      if (!formData.subject_id) {
        toast.error("Vui lòng chọn chủ đề bài thi");
        return;
      }

      const payload = {
        name: formData.name,
        subject_id: Number(formData.subject_id),
        // Remove skillType if backend doesn't expect it
        // skillType: Number(formData.subject_id),
      };

      if (data?.id) {
        await updateExam({ ...payload, id: data.id }).unwrap();
        toast.success("Cập nhật bài thi thành công!");
      } else {
        await createExam(payload).unwrap();
        toast.success("Tạo bài thi thành công!");
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      console.error("Error response:", error.data);
      setErrorDetail(error?.data?.message || "Đã xảy ra lỗi");
      toast.error(error?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {data ? "Cập nhật bài thi" : "Tạo bài thi"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tạo/cập nhật thông tin chi tiết cho bài thi.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(sendRequest)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {/* Error Message */}
            {errorDetail && (
              <Typography color="error" variant="body2">
                {errorDetail}
              </Typography>
            )}

            {/* Tên bài thi */}
            <TextField
              fullWidth
              label="Tên bài thi"
              placeholder="Nhập tên bài thi"
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name", {
                required: "Tên bài thi là bắt buộc",
                minLength: {
                  value: 2,
                  message: "Tên phải có ít nhất 2 ký tự",
                },
              })}
            />

            {/* Chủ đề bài thi */}
            <Controller
              name="subject_id"
              control={control}
              rules={{ required: "Chủ đề là bắt buộc" }}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <InputLabel id="subject-select-label">
                    Chủ đề bài thi
                  </InputLabel>
                  <Select
                    labelId="subject-select-label"
                    label="Chủ đề bài thi"
                    value={field.value || "1"}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={String(subject.id)}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isLoading}>
            Hủy
          </Button>

          {/* Debug button - remove this in production */}
          <Button
            onClick={handleSubmit((data) =>
              console.log("Current form data:", data)
            )}
            variant="text"
            size="small"
            sx={{ mr: 1 }}>
            Debug
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}>
            {data?.id ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExamAction;
