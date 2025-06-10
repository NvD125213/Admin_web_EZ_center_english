import { useState } from "react";
import {
  useGetBlogsQuery,
  useDeleteBlogMutation,
} from "../../../services/blogServices";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import BaseTable, {
  BaseTableState,
  DefaultTableState,
  HeaderTable,
} from "../../../components/common/BaseTable";
import {
  Box,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const columns: HeaderTable[] = [
  {
    name: "Tiêu đề",
    key: "title",
    sortable: true,
  },
  {
    name: "Mô tả",
    key: "description",
    row: (value) => value || "-",
  },
  {
    name: "Ảnh tiêu đề",
    key: "image_title",
    row: (value) =>
      value ? (
        <Box
          component="img"
          src={value}
          alt="Title image"
          sx={{
            width: 100,
            height: 60,
            objectFit: "cover",
            borderRadius: 1,
          }}
        />
      ) : (
        "-"
      ),
  },
  {
    name: "Menu",
    key: "menu",
    row: (value) => value?.name || "-",
    sortable: true,
  },
  {
    name: "Trạng thái",
    key: "status",
    sortable: true,

    row: (value) => (
      <Box
        sx={{
          backgroundColor: value === "Open" ? "success.light" : "error.light",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          display: "inline-block",
          textAlign: "center",
          width: "70%",
        }}>
        {value === "Open" ? "Active" : "Inactive"}
      </Box>
    ),
  },
  {
    name: "Người tạo",
    key: "user",
    row: (value) => value?.full_name || "-",
  },
  {
    name: "Ngày tạo",
    key: "create_at",
    sortable: true,

    row: (value) => new Date(value).toLocaleDateString("vi-VN"),
  },
];

const BlogView = () => {
  const navigate = useNavigate();
  const [tableState, setTableState] =
    useState<BaseTableState>(DefaultTableState);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [deleteBlog] = useDeleteBlogMutation();

  const { data, isLoading } = useGetBlogsQuery({
    page: tableState.pageIndex || 1,
    limit: tableState.pageSize || 10,
    sort_by: (tableState.sortBy as "create_at" | "title") || "create_at",

    sort_order: (tableState.sortOrder as "asc" | "desc") || "desc",
    search: searchTerm || undefined,
  });

  const handleCreateBlog = () => {
    navigate("/blog/detail");
  };

  const handleEditBlog = (blog: any) => {
    navigate(`/blog/detail/${blog.id}`);
  };

  const handleDeleteClick = (blog: any) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBlog) return;

    try {
      await toast.promise(deleteBlog(selectedBlog.id).unwrap(), {
        loading: "Đang xóa bài viết...",
        success: "Xóa bài viết thành công!",
        error: "Có lỗi xảy ra khi xóa bài viết!",
      });
      setDeleteDialogOpen(false);
      setSelectedBlog(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedBlog(null);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Quản lý bài viết" />
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <TextField
            size="small"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" onClick={handleCreateBlog}>
            Tạo blog mới
          </Button>
        </Stack>

        <BaseTable
          columns={columns}
          data={data?.data || []}
          tableState={tableState}
          onTableStateChange={setTableState}
          count={data?.total || 0}
          isPending={isLoading}
          actionsColumn={{
            label: "Thao tác",
            actions: [
              {
                label: "Sửa",
                icon: <FiEdit2 />,
                className: "text-blue-500",
                onClick: handleEditBlog,
              },
              {
                label: "Xóa",
                icon: <FiTrash2 />,
                className: "text-red-500",
                onClick: handleDeleteClick,
              },
            ],
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa bài viết "{selectedBlog?.title}" không?
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Hủy</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default BlogView;
