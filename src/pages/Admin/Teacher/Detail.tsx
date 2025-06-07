import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { FiUpload } from "react-icons/fi";

import {
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  CreateTeacherRequest,
} from "../../../services/teacherServices";
import toast from "react-hot-toast";
import { useTheme } from "@mui/material";

interface FormData extends CreateTeacherRequest {
  photo: string;
  password: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const theme = useTheme();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    photo: "",
    description: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Get teacher data if in edit mode
  const { data: teacherData, isLoading: isLoadingTeacher } =
    useGetTeacherByIdQuery(Number(id || 0), {
      skip: !isEditMode,
    });

  const [createTeacher] = useCreateTeacherMutation();
  const [updateTeacher] = useUpdateTeacherMutation();

  useEffect(() => {
    if (isEditMode && teacherData) {
      setFormData({
        name: teacherData.name || "",
        email: teacherData.email || "",
        phone: teacherData.phone || "",
        photo: teacherData.photo || "",
        description: teacherData.description || "",
        password: "",
      });
    }
  }, [isEditMode, teacherData]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/drw8mvi2f/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Không thể tải ảnh lên!");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        photo: url,
      }));
    } catch (error) {
      toast.error("Không thể tải ảnh lên!");
    }
  };

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string) => {
    const error = validationErrors.find((err) => err.field === fieldName);
    return error?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]); // Clear previous errors

    try {
      if (isEditMode) {
        const updateData = {
          ...formData,
          password: formData.password || undefined,
        };
        await toast.promise(
          updateTeacher({ id: Number(id), data: updateData }).unwrap(),
          {
            loading: "Cập nhật giáo viên...",
            success: "Cập nhật giáo viên thành công!",
            error: (err) => {
              if (err?.data?.error && Array.isArray(err.data.error)) {
                setValidationErrors(err.data.error);
                return "Vui lòng kiểm tra lại thông tin!";
              }
              return err?.data?.error || "Đã có lỗi xảy ra khi lưu giáo viên!";
            },
          }
        );
      } else {
        if (!formData.password) {
          setValidationErrors([
            { field: "password", message: "Vui lòng nhập mật khẩu!" },
          ]);
          return;
        }
        await toast.promise(createTeacher(formData).unwrap(), {
          loading: "Tạo giáo viên mới...",
          success: "Thêm giáo viên mới thành công!",
          error: (err) => {
            if (err?.data?.error && Array.isArray(err.data.error)) {
              setValidationErrors(err.data.error);
              return "Vui lòng kiểm tra lại thông tin!";
            }
            return err?.data?.error || "Đã có lỗi xảy ra khi lưu giáo viên!";
          },
        });
      }
      navigate("/teacher");
    } catch (error) {
      console.error("Error saving teacher:", error);
    }
  };

  if (isLoadingTeacher) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#101828" : "white",
          border: "none",
          boxShadow: "none",
          color: theme.palette.mode === "dark" ? "white" : "inherit",
        }}>
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              marginBottom: "20px",
            }}
            gutterBottom>
            {isEditMode ? "Chỉnh sửa giáo viên" : "Tạo giáo viên mới"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gap: 3,
              }}>
              {/* Row 1 - Basic Info */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "5fr 1fr" },
                  gap: 3,
                }}>
                {/* Left - Text Fields */}
                <Box sx={{ display: "grid", gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Tên giáo viên"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    required
                    error={Boolean(getFieldError("name"))}
                    helperText={getFieldError("name")}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    required
                    error={Boolean(getFieldError("email"))}
                    helperText={getFieldError("email")}
                  />

                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleTextChange}
                    required
                    error={Boolean(getFieldError("phone"))}
                    helperText={getFieldError("phone")}
                  />

                  {!isEditMode && (
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleTextChange}
                      required
                      error={Boolean(getFieldError("password"))}
                      helperText={getFieldError("password")}
                    />
                  )}
                  {isEditMode && (
                    <TextField
                      fullWidth
                      label="Mật khẩu mới (để trống nếu không muốn thay đổi)"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleTextChange}
                      error={Boolean(getFieldError("password"))}
                      helperText={getFieldError("password")}
                    />
                  )}
                </Box>

                {/* Right - Photo Upload */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<FiUpload />}
                      sx={{
                        width: "fit-content",
                        height: "56px",
                        paddingLeft: 2,
                        paddingRight: 2,
                        borderColor: getFieldError("photo")
                          ? "error.main"
                          : undefined,
                        color: getFieldError("photo")
                          ? "error.main"
                          : undefined,
                        "&:hover": {
                          borderColor: getFieldError("photo")
                            ? "error.main"
                            : undefined,
                        },
                      }}>
                      {formData.photo ? "Thay đổi ảnh" : "Tải ảnh lên"}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {getFieldError("photo") && (
                      <Typography color="error" variant="caption">
                        {getFieldError("photo")}
                      </Typography>
                    )}

                    {formData.photo ? (
                      <Box
                        sx={{
                          width: "150px",
                          height: "220px",
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}>
                        <img
                          src={formData.photo}
                          alt="Teacher preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: "140px",
                          height: "160px",
                          border: "2px dashed",
                          borderColor: "divider",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "action.hover",
                        }}>
                        <Typography
                          color="text.secondary"
                          align="center"
                          variant="caption">
                          Chưa có ảnh
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Row 2 - Description */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Mô tả
                </Typography>
                {getFieldError("description") && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ mb: 1, display: "block" }}>
                    {getFieldError("description")}
                  </Typography>
                )}
                <Editor
                  apiKey="j0bb519pnezqzfow6d3iwbefy6ghpuhjwdbm0q2y0omi4b2d"
                  value={formData.description}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "help",
                      "wordcount",
                    ],
                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "removeformat | help",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    images_upload_handler: async (blobInfo: any) => {
                      if (!blobInfo || typeof blobInfo.blob !== "function") {
                        throw new Error("Không thể đọc blob từ ảnh");
                      }

                      try {
                        const file = blobInfo.blob();
                        const url = await uploadImageToCloudinary(file);
                        setFormData((prev) => ({
                          ...prev,
                          photo: url,
                        }));
                        return url;
                      } catch (error) {
                        console.error("Upload error", error);
                        throw new Error("Upload failed");
                      }
                    },
                    paste_data_images: true,
                    automatic_uploads: true,
                    file_picker_types: "image",
                  }}
                />
              </Box>

              {/* Row 3 - Action Buttons */}
              <Box>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/teacher")}>
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      !formData.name || !formData.email || !formData.phone
                    }>
                    {isEditMode ? "Cập nhật" : "Tạo mới"}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherDetail;
