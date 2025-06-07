import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
} from "../../../services/classServices";
import { useGetTeacherQuery } from "../../../services/teacherServices";
import { useGetCoursesQuery } from "../../../services/courseServices";
import { useGetAddressesQuery } from "../../../services/addressServices";
import { useGetWeekDayAllQuery } from "../../../services/weekdayServices";
import { toast } from "react-hot-toast";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // States
  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    course_id: "",
    address_id: "",
    start_date: null as Date | null,
    end_date: null as Date | null,
  });

  const [weekdays, setWeekdays] = useState<
    Array<{
      weekday_id: number;
      week_day: number;
      hours: number;
      start_time: string;
    }>
  >([]);

  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  // Queries
  const { data: classData, isLoading: isLoadingClass } = useGetClassByIdQuery(
    Number(id),
    { skip: !isEdit }
  );
  const { data: teachersData } = useGetTeacherQuery({});
  const { data: coursesData } = useGetCoursesQuery({});
  const { data: addressesData } = useGetAddressesQuery({});
  const { data: weekdaysData } = useGetWeekDayAllQuery({
    page: 1,
    limit: 100, // Get all weekdays
    sort_by: "week_day",
    sort_order: "asc",
  });

  // Mutations
  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();

  // Load class data if in edit mode
  useEffect(() => {
    if (isEdit && classData) {
      const {
        name,
        teacher_id,
        course_id,
        address_id,
        start_date,
        end_date,
        class_schedules,
      } = classData.data;
      setFormData({
        name,
        teacher_id: String(teacher_id),
        course_id: String(course_id),
        address_id: String(address_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      });
      if (class_schedules) {
        // Set selected weekday IDs
        setSelectedWeekdays(
          class_schedules.map((schedule: any) => schedule.weekday_id)
        );
        // Map class_schedules to include weekday information
        setWeekdays(
          class_schedules.map((schedule: any) => ({
            weekday_id: schedule.weekday_id,
            week_day: schedule.weekday.week_day,
            hours: schedule.weekday.hours,
            start_time: schedule.weekday.start_time,
          }))
        );
      }
    }
  }, [isEdit, classData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWeekdayChange = (event: any) => {
    const {
      target: { value },
    } = event;

    // Convert to array if it's not already
    const selectedIds = typeof value === "string" ? value.split(",") : value;
    setSelectedWeekdays(selectedIds);

    // Update weekdays state with selected weekdays
    const selectedWeekdayData =
      weekdaysData?.data
        .filter((w) => selectedIds.includes(w.id))
        .map((w) => ({
          weekday_id: w.id,
          week_day: w.week_day,
          hours: w.hours,
          start_time: w.start_time,
        })) || [];

    setWeekdays(selectedWeekdayData);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const submitData = {
        ...formData,
        teacher_id: Number(formData.teacher_id),
        course_id: Number(formData.course_id),
        address_id: Number(formData.address_id),
        start_date: format(formData.start_date!, "yyyy-MM-dd"),
        end_date: format(formData.end_date!, "yyyy-MM-dd"),
        class_weekdays: weekdays.map((w) => ({
          weekday_id: w.weekday_id,
          week_day: w.week_day,
          hours: w.hours,
          start_time: w.start_time,
        })),
      };

      if (isEdit) {
        await updateClass({ id: Number(id), data: submitData }).unwrap();
        toast.success("Cập nhật lớp học thành công!");
      } else {
        await createClass(submitData).unwrap();
        toast.success("Tạo lớp học thành công!");
      }
      navigate("/classroom");
    } catch (error: any) {
      console.error("Error submitting class:", error);
      toast.error(error.data.error ?? "Có lỗi xảy ra khi tạo lớp học!");
    }
  };

  if (isEdit && isLoadingClass) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <Stack className="p-6">
        <Stack spacing={3}>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h5" className="mt-2">
                {isEdit ? "Cập nhật lớp học" : "Thêm lớp học mới"}
              </Typography>
            </div>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/classroom")}>
              Quay lại
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                name="name"
                label="Tên lớp"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                fullWidth
              />

              <TextField
                name="teacher_id"
                label="Giáo viên"
                select
                value={formData.teacher_id}
                onChange={(e) =>
                  handleInputChange("teacher_id", e.target.value)
                }
                required
                fullWidth>
                {teachersData?.data.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="course_id"
                label="Khóa học"
                select
                value={formData.course_id}
                onChange={(e) => handleInputChange("course_id", e.target.value)}
                required
                fullWidth>
                {coursesData?.data.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.menu?.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="address_id"
                label="Địa chỉ"
                select
                value={formData.address_id}
                onChange={(e) =>
                  handleInputChange("address_id", e.target.value)
                }
                required
                fullWidth>
                {addressesData?.data.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                  </MenuItem>
                ))}
              </TextField>

              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={vi}>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formData.start_date}
                    onChange={(date) => handleInputChange("start_date", date)}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                      },
                    }}
                  />

                  <DatePicker
                    label="Ngày kết thúc"
                    value={formData.end_date}
                    onChange={(date) => handleInputChange("end_date", date)}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                      },
                    }}
                  />
                </Stack>
              </LocalizationProvider>

              {/* Weekdays section */}
              <Box className="space-y-6">
                <Typography
                  variant="h6"
                  style={{
                    marginBottom: "20px",
                  }}>
                  Lịch học trong tuần
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="weekday-select-label">Buổi học</InputLabel>
                  <Select
                    labelId="weekday-select-label"
                    multiple
                    value={selectedWeekdays}
                    onChange={handleWeekdayChange}
                    input={<OutlinedInput label="Buổi học" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((weekdayId) => {
                          const weekday = weekdaysData?.data.find(
                            (w) => w.id === weekdayId
                          );
                          return weekday ? (
                            <Chip
                              key={weekdayId}
                              label={`${getWeekdayName(weekday.week_day)} - ${
                                weekday.start_time
                              } (${weekday.hours} giờ)`}
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}>
                    {weekdaysData?.data.map((weekday) => (
                      <MenuItem key={weekday.id} value={weekday.id}>
                        {`${getWeekdayName(weekday.week_day)} - ${
                          weekday.start_time
                        } (${weekday.hours} giờ)`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Form actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/classroom")}>
                  Hủy
                </Button>
                <Button type="submit" variant="contained">
                  {isEdit ? "Cập nhật" : "Tạo lớp học"}
                </Button>
              </div>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </div>
  );
};

export default ClassDetail;
