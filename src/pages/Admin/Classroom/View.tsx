import { useState, useEffect } from "react";
import {
  useGetClassAllQuery,
  useDeleteClassMutation,
  ClassType,
} from "../../../services/classServices";
import { useGetTeacherQuery } from "../../../services/teacherServices";
import { useGetCoursesQuery } from "../../../services/courseServices";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { PiStudent } from "react-icons/pi";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

const ClassroomView = () => {
  const navigate = useNavigate();
  const [tableState, setTableState] =
    useState<BaseTableState>(DefaultTableState);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [deleteClass] = useDeleteClassMutation();
  const [classesWithCourses, setClassesWithCourses] = useState<ClassType[]>([]);

  // Get teachers for filter
  const { data: teachersData } = useGetTeacherQuery({});

  const { data, isLoading: isClassesLoading } = useGetClassAllQuery({
    page: tableState.pageIndex || 1,
    limit: tableState.pageSize || 10,
    sort_by:
      (tableState.sortBy as "create_at" | "name" | "start_date" | "end_date") ||
      "create_at",
    sort_order: (tableState.sortOrder as "asc" | "desc") || "desc",
    search: searchTerm || undefined,
    teacher_id: Number(selectedTeacher) || undefined,
  });

  // Get all courses in one query
  const { data: coursesData, isLoading: isCoursesLoading } = useGetCoursesQuery(
    {
      limit: 100, // Adjust this number based on your needs
    }
  );

  // Update classes with course details when either data changes
  useEffect(() => {
    if (!data?.data || !coursesData?.data) return;

    const updatedClasses = data.data.map((classItem) => {
      const course = coursesData.data.find(
        (course) => course.id === classItem.course_id
      );

      return {
        ...classItem,
        course: course,
      };
    });

    setClassesWithCourses(updatedClasses);
  }, [data?.data, coursesData?.data]);

  const handleCreateClass = () => {
    navigate("/classroom/detail");
  };

  const handleEditClass = (classData: ClassType) => {
    navigate(`/classroom/detail/${classData.id}`);
  };

  const handleClassStudent = (classData: ClassType) => {
    navigate(`/classroom/detail/${classData.id}/students`);
  };

  const handleDeleteClick = (classData: ClassType) => {
    setSelectedClass(classData);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;

    try {
      await toast.promise(deleteClass(selectedClass.id).unwrap(), {
        loading: "Đang xóa lớp học...",
        success: "Xóa lớp học thành công!",
        error: "Có lỗi xảy ra khi xóa lớp học!",
      });
      setDeleteDialogOpen(false);
      setSelectedClass(null);
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedClass(null);
  };

  const handleTeacherChange = (event: any) => {
    setSelectedTeacher(event.target.value);
    // Reset to first page when filter changes
    setTableState((prev) => ({ ...prev, pageIndex: 1 }));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Reset to first page when searching
    setTableState((prev) => ({ ...prev, pageIndex: 1 }));
  };

  const columns: HeaderTable[] = [
    {
      key: "name",
      name: "Tên lớp",
      sortable: true,
      row: (_: any, rowData: ClassType) => rowData.name,
    },
    {
      key: "teacher",
      name: "Giáo viên",
      row: (_: any, rowData: ClassType) => rowData.teacher?.name || "-",
    },
    {
      key: "course",
      name: "Khóa học",
      row: (_: any, rowData: ClassType) => {
        const classWithCourse = classesWithCourses.find(
          (c) => c.id === rowData.id
        );
        return classWithCourse?.course?.menu?.name || "-";
      },
    },
    {
      key: "start_date",
      name: "Ngày bắt đầu",
      sortable: true,
      row: (_: any, rowData: ClassType) => {
        return new Date(rowData.start_date).toLocaleDateString("vi-VN");
      },
    },
    {
      key: "end_date",
      name: "Ngày kết thúc",
      sortable: true,
      row: (_: any, rowData: ClassType) => {
        return new Date(rowData.end_date).toLocaleDateString("vi-VN");
      },
    },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Quản lý lớp học" />
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ width: 300 }}
            />
            <FormControl size="small" sx={{ width: 300 }}>
              <InputLabel>Lọc theo giáo viên</InputLabel>
              <Select
                value={selectedTeacher}
                onChange={handleTeacherChange}
                label="Lọc theo giáo viên">
                <MenuItem value="">Tất cả giáo viên</MenuItem>
                {teachersData?.data.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Button variant="contained" onClick={handleCreateClass}>
            Tạo lớp học mới
          </Button>
        </Stack>

        <BaseTable
          columns={columns}
          data={classesWithCourses}
          tableState={tableState}
          onTableStateChange={setTableState}
          count={data?.total || 0}
          isPending={isClassesLoading || isCoursesLoading}
          actionsColumn={{
            label: "Thao tác",
            actions: [
              {
                label: "Sửa",
                icon: <FiEdit2 />,
                className: "text-blue-500",
                onClick: handleEditClass,
              },
              {
                label: "Học viên",
                icon: <PiStudent />,
                className: "text-blue-500",
                onClick: handleClassStudent,
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
              Bạn có chắc chắn muốn xóa lớp học "{selectedClass?.name}" không?
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

export default ClassroomView;
