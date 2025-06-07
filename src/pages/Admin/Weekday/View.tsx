import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  useGetWeekDayAllQuery,
  useDeleteWeekdayMutation,
  useCreateWeekdayMutation,
  useUpdateWeekdayMutation,
  useGetWeekDayByIdQuery,
} from "../../../services/weekdayServices";

import toast from "react-hot-toast";
import BaseTable, {
  BaseTableState,
  HeaderTable,
} from "../../../components/common/BaseTable";
import { WeekdayType } from "../../../services/weekdayServices";

interface WeekdayFormData {
  week_day: number;
  hours: number;
  start_time: string;
}

const initialFormData: WeekdayFormData = {
  week_day: 2,
  hours: 2,
  start_time: "08:00",
};

const WeekdayView: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<WeekdayFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof WeekdayFormData, string>>
  >({});

  const [tableState, setTableState] = useState<BaseTableState>({
    pageIndex: 1,
    pageSize: 10,
    sortBy: "create_at",
    sortOrder: "desc",
    selectedItems: [],
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useGetWeekDayAllQuery({
    page: tableState.pageIndex,
    limit: tableState.pageSize,
    sort_by: tableState.sortBy as "create_at" | "week_day" | "start_time",
    sort_order: tableState.sortOrder as "asc" | "desc",
    search: search || undefined,
  });

  const { data: weekdayData, isLoading: isWeekdayLoading } =
    useGetWeekDayByIdQuery(Number(selectedId), {
      skip: !selectedId || !isEditMode,
    });
  const [deleteWeekday] = useDeleteWeekdayMutation();
  const [createWeekday] = useCreateWeekdayMutation();
  const [updateWeekday] = useUpdateWeekdayMutation();

  // Effect để cập nhật form data khi weekdayData thay đổi
  useEffect(() => {
    if (isEditMode && weekdayData?.data && openModal) {
      setFormData({
        week_day: weekdayData.data.week_day,
        hours: weekdayData.data.hours,
        start_time: weekdayData.data.start_time,
      });
    } else if (!isEditMode && openModal) {
      setFormData(initialFormData);
    }
  }, [isEditMode, weekdayData, openModal, selectedId]);

  const handleOpenModal = (mode: "create" | "edit", id?: number) => {
    if (mode === "edit" && id) {
      setIsEditMode(true);
      setSelectedId(id);
      // Reset form to initial data first to avoid undefined values
      setFormData(initialFormData);
    } else {
      setIsEditMode(false);
      setSelectedId(null);
      setFormData(initialFormData);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrors({});
    setFormData(initialFormData);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WeekdayFormData, string>> = {};

    if (!formData.week_day) {
      newErrors.week_day = "Vui lòng chọn ngày trong tuần";
    }

    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = "Số giờ học phải lớn hơn 0";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Vui lòng chọn thời gian bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        week_day: formData.week_day,
        hours: formData.hours,
        start_time: formData.start_time,
      };

      if (isEditMode && selectedId) {
        await updateWeekday({
          id: selectedId,
          data: submitData,
        }).unwrap();
        toast.success("Cập nhật buổi học thành công");
      } else {
        await createWeekday(submitData).unwrap();
        toast.success("Tạo buổi học thành công");
      }
      handleCloseModal();
      refetch();
    } catch (error: any) {
      if (error.data?.error) {
        if (Array.isArray(error.data.error)) {
          error.data.error.forEach((err: any) => {
            toast.error(err.message);
          });
        } else {
          toast.error(error.data.error);
        }
      } else {
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setTableState((prev) => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa buổi học này?")) {
      try {
        await deleteWeekday(id).unwrap();
        toast.success("Xóa buổi học thành công");
        refetch();
      } catch (error) {
        toast.error("Không thể xóa buổi học đang được sử dụng");
      }
    }
  };

  const getWeekdayName = (day: number) => {
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return weekdays[day - 1];
  };

  const formatTime = (time: string): string => {
    // If it's already in HH:mm format, return as is
    if (time.match(/^\d{2}:\d{2}$/)) {
      return time;
    }
    return "00:00"; // Fallback
  };

  const columns: HeaderTable[] = [
    {
      name: "ID",
      key: "id",
      sortable: false,
    },
    {
      name: "Ngày trong tuần",
      key: "week_day",
      sortable: true,
      row: (value) => getWeekdayName(value),
    },
    {
      name: "Thời gian bắt đầu",
      key: "start_time",
      sortable: true,
      row: (value) => formatTime(value),
    },
    {
      name: "Số giờ học",
      key: "hours",
      sortable: false,
    },
  ];

  const actions = [
    {
      label: "Sửa",
      icon: <EditIcon fontSize="small" />,
      className: "text-blue-500",
      onClick: (item: WeekdayType) => handleOpenModal("edit", item.id),
    },
    {
      label: "Xóa",
      icon: <DeleteIcon fontSize="small" />,
      className: "text-red-500",
      onClick: (item: WeekdayType) => handleDelete(item.id),
    },
  ];

  // Hiển thị loading khi đang fetch data cho edit mode
  const isModalLoading = isEditMode && isWeekdayLoading;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}>
        <Typography variant="h5" component="h1">
          Quản lý thời gian học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal("create")}>
          Thêm buổi học
        </Button>
      </Box>

      <Box sx={{ mb: 3, width: "30%" }}>
        <TextField
          fullWidth
          label="Tìm kiếm theo thời gian"
          variant="outlined"
          value={search}
          onChange={handleSearch}
        />
      </Box>

      <BaseTable
        columns={columns}
        data={data?.data || []}
        tableState={tableState}
        onTableStateChange={setTableState}
        count={data?.total || 0}
        isPending={isLoading}
        hideCheckboxes
        actionsColumn={{
          label: "Thao tác",
          actions,
        }}
      />

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          {isEditMode ? "Sửa buổi học" : "Thêm buổi học mới"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {isModalLoading ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Ngày trong tuần"
                  value={formData.week_day || 2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      week_day: Number(e.target.value),
                    }))
                  }
                  error={Boolean(errors.week_day)}
                  helperText={errors.week_day}>
                  <MenuItem value={2}>Thứ 2</MenuItem>
                  <MenuItem value={3}>Thứ 3</MenuItem>
                  <MenuItem value={4}>Thứ 4</MenuItem>
                  <MenuItem value={5}>Thứ 5</MenuItem>
                  <MenuItem value={6}>Thứ 6</MenuItem>
                  <MenuItem value={7}>Thứ 7</MenuItem>
                  <MenuItem value={8}>Chủ nhật</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  type="time"
                  label="Thời gian bắt đầu"
                  value={formData.start_time || "08:00"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
                  }
                  error={Boolean(errors.start_time)}
                  helperText={errors.start_time}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Số giờ học"
                  value={formData.hours || 2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hours: Number(e.target.value),
                    }))
                  }
                  error={Boolean(errors.hours)}
                  helperText={errors.hours}
                  inputProps={{ min: 1 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isModalLoading}>
              {isEditMode ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default WeekdayView;
