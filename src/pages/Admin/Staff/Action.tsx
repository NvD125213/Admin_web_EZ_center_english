import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { FiUpload } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

import {
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  CreateStaffRequest,
} from "../../../services/staffServices";

interface FormData extends CreateStaffRequest {
  photo: string;
  password: string;
  position: "" | "writer" | "moderator";
}

const StaffDetail = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    photo: "",
    position: "",
    password: "",
  });

  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffByIdQuery(
    Number(id),
    { skip: !isEditMode }
  );

  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();

  useEffect(() => {
    if (isEditMode && staffData) {
      setFormData((prev) => ({
        ...prev,
        name: staffData.name || "",
        email: staffData.email || "",
        phone: staffData.phone || "",
        photo: staffData.photo || "",
        position: (staffData.position || "") as "" | "writer" | "moderator",
        password: "", // reset password field when editing
      }));
    }
  }, [isEditMode, staffData]);

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value as string,
      }));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "ml_default");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/drw8mvi2f/image/upload",
        form
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Không thể tải ảnh lên!");
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        photo: url,
      }));
    } catch {
      toast.error("Không thể tải ảnh lên!");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        const { password, ...rest } = formData;
        const updateData = {
          ...rest,
          ...(password && { password }), // include password only if not empty
        };

        await toast.promise(
          updateStaff({ id: Number(id), data: updateData }).unwrap(),
          {
            loading: "Đang cập nhật nhân viên...",
            success: "Cập nhật thành công!",
            error: (err) =>
              err?.data?.error || "Đã xảy ra lỗi khi cập nhật nhân viên!",
          }
        );
      } else {
        if (!formData.password) {
          toast.error("Vui lòng nhập mật khẩu!");
          return;
        }

        await toast.promise(createStaff(formData).unwrap(), {
          loading: "Đang tạo nhân viên...",
          success: "Tạo mới thành công!",
          error: (err) =>
            err?.data?.error || "Đã xảy ra lỗi khi tạo mới nhân viên!",
        });
      }

      navigate("/Staff");
    } catch (error) {
      console.error("Save staff error:", error);
    }
  };

  if (isLoadingStaff) return <Typography>Đang tải...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#101828" : "white",
          boxShadow: "none",
          color: theme.palette.mode === "dark" ? "white" : "inherit",
        }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {isEditMode ? "Chỉnh sửa nhân viên" : "Tạo nhân viên mới"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Row 1: Name and Position */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}>
                <TextField
                  label="Tên nhân viên"
                  name="name"
                  value={formData.name}
                  onChange={handleTextChange}
                  required
                />
                <FormControl required>
                  <InputLabel>Vị trí</InputLabel>
                  <Select
                    name="position"
                    value={formData.position}
                    label="Vị trí"
                    onChange={(e) => {
                      const value = e.target.value as
                        | ""
                        | "writer"
                        | "moderator";
                      setFormData((prev) => ({
                        ...prev,
                        position: value,
                      }));
                    }}>
                    <MenuItem value="" disabled>
                      Lựa chọn chức vụ
                    </MenuItem>
                    <MenuItem value="writer">Writer</MenuItem>
                    <MenuItem value="moderator">Moderator</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Row 2: Email and Phone */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  required
                />
                <TextField
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleTextChange}
                  required
                />
              </Box>

              {/* Row 3: Password and Photo Upload */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}>
                <TextField
                  label={
                    isEditMode ? "Mật khẩu mới (nếu cần thay đổi)" : "Mật khẩu"
                  }
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleTextChange}
                  required={!isEditMode}
                />
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FiUpload />}
                    sx={{ width: "100%", height: "56px", px: 2 }}>
                    {formData.photo ? "Thay đổi ảnh" : "Tải ảnh lên"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </Button>
                </Box>
                <Box>
                  {formData.photo ? (
                    <Box
                      sx={{
                        width: 150,
                        height: 220,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 1,
                      }}>
                      <img
                        src={formData.photo}
                        alt="Ảnh nhân viên"
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
                        width: 140,
                        height: 160,
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "action.hover",
                      }}>
                      <Typography color="text.secondary" variant="caption">
                        Chưa có ảnh
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Row 4: Action Buttons */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" onClick={() => navigate("/Staff")}>
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      !formData.name ||
                      !formData.email ||
                      !formData.phone ||
                      !formData.position
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

export default StaffDetail;
