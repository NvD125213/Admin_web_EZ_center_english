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
} from "@mui/material";
import {
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useGetMenusQuery,
  Menu,
} from "../../../services/menuServices";
import { renderMenuOptions } from "../../../components/MenuSelect";
import toast from "react-hot-toast";
import { useTheme } from "@mui/material";

interface FormData {
  name: string;
  sort: number;
  status: "Open" | "Close";
  parent_id: number | "";
}

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    sort: 0,
    status: "Open",
    parent_id: "",
  });

  // Get menu data if in edit mode
  const { data: menuData, isLoading: isLoadingMenu } = useGetMenuByIdQuery(
    Number(id || 0),
    {
      skip: !isEditMode,
    }
  );

  // Get all menus for parent selection
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

  const [createMenu] = useCreateMenuMutation();
  const [updateMenu] = useUpdateMenuMutation();

  useEffect(() => {
    if (isEditMode && menuData) {
      setFormData({
        name: menuData.name || "",
        sort: menuData.sort || 0,
        status: menuData.status || "Open",
        parent_id: menuData.parent_id || "",
      });
    }
  }, [isEditMode, menuData]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sort" ? Number(value) : value,
    }));
  };

  const handleParentChange = (e: SelectChangeEvent<number | "">) => {
    setFormData((prev) => ({
      ...prev,
      parent_id: e.target.value,
    }));
  };

  const handleStatusChange = (e: SelectChangeEvent<"Open" | "Close">) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert empty string to undefined for API
    const submitData = {
      ...formData,
      parent_id:
        formData.parent_id === "" ? undefined : Number(formData.parent_id),
    };

    try {
      await toast.promise(
        isEditMode
          ? updateMenu({ id: Number(id), data: submitData }).unwrap()
          : createMenu(submitData).unwrap(),
        {
          loading: isEditMode ? "Cập nhật menu..." : "Tạo menu mới...",
          success: isEditMode
            ? "Cập nhật menu thành công!"
            : "Thêm menu mới thành công!",
          error: (err) => {
            return err?.data?.error || "Đã có lỗi xảy ra khi lưu menu!";
          },
        }
      );
      navigate("/menu");
    } catch (error) {
      console.error("Error saving menu:", error);
    }
  };

  if (isLoadingMenu) {
    return <Typography>Loading...</Typography>;
  }

  // Filter out current menu and its children from parent options
  const parentOptions = menusData?.data?.filter((menu: Menu) => {
    if (!isEditMode) return true;
    if (menu.id === Number(id)) return false;
    if (menu.parent_id === Number(id)) return false;
    return true;
  });
  const theme = useTheme();

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
          <Typography variant="h5" gutterBottom>
            {isEditMode ? "Chỉnh sửa menu" : "Tạo menu mới"}
          </Typography>

          {menusError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Lỗi khi tải danh sách menu: {JSON.stringify(menusError)}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Tên menu"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Menu cha</InputLabel>
                <Select<number | "">
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleParentChange}
                  label="Menu cha"
                  disabled={isLoadingMenus}>
                  <MenuItem value="">Không có</MenuItem>
                  {parentOptions && renderMenuOptions(parentOptions)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select<"Open" | "Close">
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  label="Trạng thái"
                  required>
                  <MenuItem value="Open">Active</MenuItem>
                  <MenuItem value="Close">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate("/menu")}>
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formData.name}>
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

export default MenuDetail;
