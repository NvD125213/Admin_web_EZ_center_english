import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
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
} from "@mui/material";
import {
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "../../../services/blogServices";
import { useGetMenusQuery } from "../../../services/menuServices";
import { renderMenuOptions } from "../../../components/MenuSelect";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import axios from "axios";
import toast from "react-hot-toast";
import { FiUpload } from "react-icons/fi";

interface FormData {
  title: string;
  content: string;
  menu_id: string;
  status: "Open" | "Close";
  description: string;
  image_title: string;
}

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    menu_id: "",
    status: "Open",
    description: "",
    image_title: "",
  });

  const { data: blogData, isLoading: isLoadingBlog } = useGetBlogByIdQuery(
    Number(id || 0),
    {
      skip: !isEditMode,
    }
  );

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

  const [createBlog] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();

  useEffect(() => {
    if (isEditMode && blogData) {
      setFormData({
        title: blogData.title || "",
        content: blogData.content || "",
        menu_id: blogData.menu_id ? String(blogData.menu_id) : "",
        status: blogData.status || "Open",
        description: blogData.description || "",
        image_title: blogData.image_title || "",
      });
    }
  }, [isEditMode, blogData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      menu_id: Number(formData.menu_id),
      user_id: Number(user?.id),
      title: formData.title,
      content: formData.content,
      status: formData.status,
      description: formData.description,
      image_title: formData.image_title,
    };

    // Using toast.promise for handling loading, success, and error
    toast
      .promise(
        isEditMode
          ? updateBlog({ id: Number(id), data: submitData }).unwrap()
          : createBlog(submitData).unwrap(),
        {
          loading: isEditMode ? "Cập nhật bài viết..." : "Tạo bài viết...",
          success: isEditMode
            ? "Cập nhật bài viết thành công!"
            : "Thêm bài viết mới thành công!",
          error: "Đã có lỗi xảy ra khi lưu bài viết!",
        }
      )
      .then(() => {
        navigate("/blog"); // Navigate after success
      })
      .catch((error) => {
        console.error("Error during saving blog:", error);
      });
  };

  const handleImageUpload = async (file: File): Promise<string> => {
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
      console.error("Upload error", error);
      throw new Error("Upload failed");
    }
  };

  const handleImageTitleChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleImageUpload(file);
      setFormData((prev) => ({
        ...prev,
        image_title: url,
      }));
    } catch (error) {
      toast.error("Lỗi khi tải lên ảnh tiêu đề");
    }
  };

  if (isLoadingBlog || isLoadingMenus) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </Typography>

          {menusError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Lỗi khi tải danh sách menu: {JSON.stringify(menusError)}
            </Alert>
          ) : !menusData?.data?.length ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Không có dữ liệu menu
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Ảnh tiêu đề
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleImageTitleChange}
                  style={{ display: "none" }}
                  id="image-title-upload"
                />
                <label htmlFor="image-title-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<FiUpload />}>
                    Tải lên ảnh tiêu đề
                  </Button>
                </label>
                {formData.image_title && (
                  <Box
                    component="img"
                    src={formData.image_title}
                    alt="Title image preview"
                    sx={{
                      mt: 2,
                      maxWidth: 300,
                      maxHeight: 200,
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>

              <FormControl fullWidth required>
                <InputLabel>Menu</InputLabel>
                <Select
                  name="menu_id"
                  value={formData.menu_id || ""}
                  onChange={handleChange}
                  label="Menu"
                  disabled={isLoadingMenus || Boolean(menusError)}>
                  {renderMenuOptions(menusData?.data || [])}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Trạng thái"
                  required>
                  <MenuItem value="Open">Active</MenuItem>
                  <MenuItem value="Close">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ minHeight: 400 }}>
                <Editor
                  apiKey="j0bb519pnezqzfow6d3iwbefy6ghpuhjwdbm0q2y0omi4b2d"
                  value={formData.content}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 400,
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
                        formData.append("file", blobInfo.blob()); // Đây là file ảnh
                        formData.append("upload_preset", "ml_default"); // Thay bằng preset Cloudinary

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
                <Button variant="outlined" onClick={() => navigate("/blog")}>
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    !formData.title || !formData.content || !formData.menu_id
                  }>
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

export default BlogDetail;
