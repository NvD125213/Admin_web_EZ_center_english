import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  Course,
  CreateCourseRequest,
} from "../../../services/courseServices";
import { useGetMenusQuery, Menu } from "../../../services/menuServices";
import { renderMenuOptions } from "../../../components/MenuSelect";
import toast from "react-hot-toast";
import { useTheme } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";

interface FormData extends Omit<CreateCourseRequest, "menu_id"> {
  menu_id: number | "";
}

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const theme = useTheme();

  const [formData, setFormData] = useState<FormData>({
    menu_id: "",
    lessons: 0,
    term: 1,
    level: "A1",
    price: 0,
    currency: "VND",
    description: "",
  });

  const [priceDisplay, setPriceDisplay] = useState("0");

  // Get course data if in edit mode
  const { data: courseData, isLoading: isLoadingCourse } =
    useGetCourseByIdQuery(Number(id || 0), {
      skip: !isEditMode,
    });

  // Get all menus for course selection
  const {
    data: menusData,
    isLoading: isLoadingMenus,
    error: menusError,
  } = useGetMenusQuery({
    page: 1,
    limit: 100,
    sort_by: "name",
    sort_order: "asc",
  });

  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();

  useEffect(() => {
    if (isEditMode && courseData) {
      setFormData({
        menu_id: courseData.menu_id || "",
        lessons: courseData.lessons || 0,
        term: courseData.term || 1,
        level: courseData.level || "A1",
        price: courseData.price || 0,
        currency: courseData.currency || "VND",
        description: courseData.description || "",
      });
      setPriceDisplay(formatPrice(courseData.price || 0));
    }
  }, [isEditMode, courseData]);

  const formatPrice = (value: string | number): string => {
    // Remove all non-digit characters
    const numericString = value.toString().replace(/\D/g, "");
    // Convert to number and format with commas
    return Number(numericString).toLocaleString("en-US");
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["lessons", "term", "price"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleMenuChange = (e: SelectChangeEvent<number | "">) => {
    setFormData((prev) => ({
      ...prev,
      menu_id: e.target.value,
    }));
  };

  const handleLevelChange = (
    e: SelectChangeEvent<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">
  ) => {
    setFormData((prev) => ({
      ...prev,
      level: e.target.value as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
    }));
  };

  const handleCurrencyChange = (e: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      currency: e.target.value,
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Format the input value immediately for display
    const formattedValue = formatPrice(value);
    setPriceDisplay(formattedValue);

    // Update form data with the numeric value
    const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
    setFormData((prev) => ({
      ...prev,
      price: numericValue,
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.menu_id) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }

    // Ensure price is a number before submitting
    const submitData: CreateCourseRequest = {
      ...formData,
      menu_id: Number(formData.menu_id),
      price: Number(formData.price), // Ensure price is a number
    };

    try {
      await toast.promise(
        isEditMode
          ? updateCourse({ id: Number(id), data: submitData }).unwrap()
          : createCourse(submitData).unwrap(),
        {
          loading: isEditMode ? "Cập nhật khóa học..." : "Tạo khóa học mới...",
          success: isEditMode
            ? "Cập nhật khóa học thành công!"
            : "Thêm khóa học mới thành công!",
          error: (err) => {
            return err?.data?.error || "Đã có lỗi xảy ra khi lưu khóa học!";
          },
        }
      );
      navigate("/course");
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  if (isLoadingCourse) {
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
            {isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </Typography>

          {menusError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Lỗi khi tải danh sách menu: {JSON.stringify(menusError)}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <FormControl fullWidth required>
                <InputLabel>Menu</InputLabel>
                <Select<number | "">
                  name="menu_id"
                  value={formData.menu_id}
                  onChange={handleMenuChange}
                  label="Menu"
                  disabled={isLoadingMenus}>
                  <MenuItem value="">Chọn khóa học</MenuItem>
                  {menusData?.data && renderMenuOptions(menusData.data)}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Số bài học"
                name="lessons"
                type="number"
                value={formData.lessons}
                onChange={handleTextChange}
                required
                inputProps={{ min: 0 }}
              />

              <TextField
                fullWidth
                label="Học kỳ (tháng)"
                name="term"
                type="number"
                value={formData.term}
                onChange={handleTextChange}
                required
                inputProps={{ min: 1 }}
              />

              <FormControl fullWidth required>
                <InputLabel>Trình độ</InputLabel>
                <Select<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">
                  name="level"
                  value={formData.level}
                  onChange={handleLevelChange}
                  label="Trình độ">
                  <MenuItem value="A1">A1</MenuItem>
                  <MenuItem value="A2">A2</MenuItem>
                  <MenuItem value="B1">B1</MenuItem>
                  <MenuItem value="B2">B2</MenuItem>
                  <MenuItem value="C1">C1</MenuItem>
                  <MenuItem value="C2">C2</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Đơn vị tiền tệ</InputLabel>
                <Select<string>
                  name="currency"
                  value={formData.currency}
                  onChange={handleCurrencyChange}
                  label="Đơn vị tiền tệ">
                  <MenuItem value="VND">VND</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Giá"
                name="price"
                value={priceDisplay}
                onChange={handlePriceChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency}
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  inputMode: "numeric",
                }}
              />

              <Box sx={{ minHeight: 500 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Mô tả
                </Typography>
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
                    images_upload_handler: (blobInfo: any) => {
                      return new Promise((resolve, reject) => {
                        if (!blobInfo || typeof blobInfo.blob !== "function") {
                          reject("Không thể đọc blob từ ảnh");
                          return;
                        }

                        const formData = new FormData();
                        formData.append("file", blobInfo.blob());
                        formData.append("upload_preset", "ml_default");

                        axios
                          .post(
                            "https://api.cloudinary.com/v1_1/drw8mvi2f/image/upload",
                            formData
                          )
                          .then((res) => {
                            const url = res.data.secure_url;
                            resolve(url);
                          })
                          .catch((err) => {
                            console.error("Upload error", err);
                            reject("Upload failed");
                          });
                      });
                    },
                    paste_data_images: true,
                    automatic_uploads: true,
                    file_picker_types: "image",
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate("/course")}>
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formData.menu_id}>
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseDetail;
