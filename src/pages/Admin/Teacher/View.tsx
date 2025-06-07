import { useState } from "react";
import {
  useGetTeacherQuery,
  useDeleteTeacherMutation,
  Teacher,
} from "../../../services/teacherServices";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import BaseTable, {
  BaseTableState,
  DefaultTableState,
  HeaderTable,
} from "../../../components/common/BaseTable";
// import { formatDate } from "../../../helper/formatDate";
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

const TeacherView = () => {
  const navigate = useNavigate();
  const [tableState, setTableState] =
    useState<BaseTableState>(DefaultTableState);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteTeacher] = useDeleteTeacherMutation();

  const { data, isLoading } = useGetTeacherQuery({
    page: tableState.pageIndex || 1,
    limit: tableState.pageSize || 10,
    sort_by:
      (tableState.sortBy as "create_at" | "name" | "email") || "create_at",
    sort_order: (tableState.sortOrder as "asc" | "desc") || "desc",
    search: searchTerm || undefined,
  });

  const handleCreateTeacher = () => {
    navigate("/teacher/detail");
  };

  const handleEditTeacher = (teacher: Teacher) => {
    navigate(`/teacher/detail/${teacher.id}`);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    try {
      await toast.promise(deleteTeacher(selectedTeacher.id).unwrap(), {
        loading: "Đang xóa giáo viên...",
        success: "Xóa giáo viên thành công!",
        error: "Có lỗi xảy ra khi xóa giáo viên!",
      });
      setDeleteDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTeacher(null);
  };

  const columns: HeaderTable[] = [
    {
      key: "name",
      name: "Tên giáo viên",
      sortable: true,
      row: (_: any, rowData: Teacher) => {
        return rowData?.name || rowData?.user?.full_name || "-";
      },
    },
    {
      key: "photo",
      name: "Ảnh",
      row: (_: any, rowData: Teacher) => {
        const photoUrl = rowData?.photo;
        return photoUrl ? (
          <Box
            sx={{
              width: 80,
              height: 100,
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid #e0e0e0",
            }}>
            <img
              src={photoUrl}
              alt={rowData?.name || rowData?.user?.full_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/50x50?text=No+Image";
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "4px",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f5f5f5",
            }}>
            <Typography variant="caption" color="text.secondary">
              No Image
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "email",
      name: "Email",
      row: (_: any, rowData: Teacher) =>
        rowData?.email || rowData?.user?.email || "-",
    },
    {
      key: "phone",
      name: "Số điện thoại",
      row: (_: any, rowData: Teacher) =>
        rowData?.phone || rowData?.user?.phone_number || "-",
    },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Quản lý nhân viên" />
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <TextField
            size="small"
            placeholder="Tìm kiếm giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="contained" onClick={handleCreateTeacher}>
            Tạo giáo viên mới
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
                onClick: handleEditTeacher,
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
              Bạn có chắc chắn muốn xóa giáo viên "{selectedTeacher?.name}"
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

export default TeacherView;
