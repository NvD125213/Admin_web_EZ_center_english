import { useState } from "react";
import {
  useGetCoursesQuery,
  useDeleteCourseMutation,
  Course,
} from "../../../services/courseServices";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import BaseTable, {
  BaseTableState,
  DefaultTableState,
  HeaderTable,
} from "../../../components/common/BaseTable";
import { formatDate } from "../../../helper/formatDate";
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
    key: "menu",
    name: "Khóa học",
    sortable: true,
    row: (value: any) => value?.name || "-",
  },
  { key: "lessons", name: "Số bài học" },
  { key: "term", name: "Học kỳ (tháng)" },
  { key: "level", name: "Trình độ" },
  {
    key: "price",
    name: "Giá",
    row: (value: number, row: any) =>
      `${Number(value).toLocaleString()} ${row.currency}`,
  },
  {
    key: "create_at",
    name: "Ngày tạo",
    row: (value: string) => formatDate(value || ""),
  },
];

const CourseView = () => {
  const navigate = useNavigate();
  const [tableState, setTableState] =
    useState<BaseTableState>(DefaultTableState);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteCourse] = useDeleteCourseMutation();

  const { data, isLoading } = useGetCoursesQuery({
    page: tableState.pageIndex || 1,
    limit: tableState.pageSize || 10,
    sort_by:
      (tableState.sortBy as "create_at" | "price" | "lessons" | "term") ||
      "create_at",
    sort_order: (tableState.sortOrder as "asc" | "desc") || "desc",
    search: searchTerm || undefined,
  });

  const handleCreateCourse = () => {
    navigate("/course/detail");
  };

  const handleEditCourse = (course: Course) => {
    navigate(`/course/detail/${course.id}`);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      await toast.promise(deleteCourse(selectedCourse.id).unwrap(), {
        loading: "Đang xóa khóa học...",
        success: "Xóa khóa học thành công!",
        error: "Có lỗi xảy ra khi xóa khóa học!",
      });
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Quản lý khóa học" />
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <TextField
            size="small"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" onClick={handleCreateCourse}>
            Tạo khóa học mới
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
                onClick: handleEditCourse,
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
              Bạn có chắc chắn muốn xóa khóa học "{selectedCourse?.menu?.name}"
              không? Hành động này không thể hoàn tác.
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

export default CourseView;
