import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useState, useEffect } from "react";
import { IoIosAdd } from "react-icons/io";
import { ExamType, SubjectType } from "../../../types";
import { PartType } from "../../../types/part";
import { useGetSubjectsQuery } from "../../../services/subjectServices";
import CommonTable from "../../../components/common/Table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryString } from "../../../hooks/useQueryString";
import { useCreatePartMutation } from "../../../services/partServices";
import {
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useModal } from "../../../hooks/useModal";
import toast from "react-hot-toast";
import {
  useGetExamsBySubjectQuery,
  useGetExamsQuery,
  useDeleteExamMutation,
} from "../../../services/examServices";
import { examApi } from "../../../services/examServices";
import ExamAction from "./ActionExam";
import { useDispatch } from "react-redux";
import ComponentCard from "../../../components/common/ComponentCard";
import { useGetPartsQuery } from "../../../services/partServices";
import { PencilIcon } from "../../../icons";
import { RiDeleteBinLine } from "react-icons/ri";

const columns: { key: keyof ExamType; label: string }[] = [
  { key: "id", label: "Mã bài thi" },
  { key: "name", label: "Tên bài thi" },
  { key: "subject_name", label: "Chủ đề thi" },
];

const ExamPage = () => {
  const queryString = useQueryString();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, openModal, closeModal } = useModal();
  const [subject, setSubject] = useState<SubjectType>();
  const [page, setPage] = useState(Number(queryString.page) || 1);
  const [limit, setLimit] = useState(Number(queryString.limit) || 10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errorDetail, setErrorDetail] = useState("");
  const [openModalPart, setOpenModalPart] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamType | undefined>(
    undefined
  );
  const { data: parts = [], isLoading: isLoadingPart } = useGetPartsQuery();
  const [selectedExamForPart, setSelectedExamForPart] = useState<
    ExamType | undefined
  >(undefined);
  const [isSubjectLoading, setIsSubjectLoading] = useState(false);
  const dispatch = useDispatch();
  // Sync state with query string changes
  useEffect(() => {
    const newPage = Number(queryString.page) || 1;
    const newLimit = Number(queryString.limit) || 10;
    if (newPage !== page || newLimit !== limit) {
      setPage(newPage);
      setLimit(newLimit);
    }
  }, [queryString.page, queryString.limit]);

  //   Redirect to default query params if missing
  useEffect(() => {
    if (!queryString.page || !queryString.limit) {
      navigate(`?page=1&limit=10`, { replace: true });
    }
  }, [navigate, queryString.page, queryString.limit]);

  //   Fetch data
  const { data, isLoading, isError, error } = subject?.id
    ? useGetExamsBySubjectQuery(Number(subject.id))
    : useGetExamsQuery({ all: true });

  useEffect(() => {
    if (!isLoading && data && Array.isArray(data.data)) {
      if (data.data.length === 0) {
        setErrorDetail("Không có dữ liệu");
      } else {
        setErrorDetail("");
      }
    }
  }, [data, isLoading]);
  const totalPages = data?.totalPages || 1;

  //Prefetch next page for faster navigation

  const prefetchExams = examApi.usePrefetch("getExams");

  useEffect(() => {
    if (page < totalPages) {
      prefetchExams({ page: page + 1, limit }, { force: true });
    }
  }, [page, limit, totalPages, prefetchExams]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    navigate(`?page=${value}&limit=${limit}`);
  };

  const handleChangeLimit = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    setPage(1);
    navigate(`?page=1&limit=${newLimit}`);
  };

  // Handle success event when update success
  const handleSuccess = () => {
    queryClient.invalidateQueries(["exams", page, limit]);
  };

  // Xóa bài thi
  const [deleteExam] = useDeleteExamMutation();

  const handleBulkDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa bài thi đã chọn không?`
    );
    if (!confirmDelete) return;

    try {
      await deleteExam(id).unwrap();
      toast.success(`Xóa ${selectedIds.length} bài thi thành công!`);

      // Invalidate (refetch) danh sách exams
      dispatch(examApi.util.invalidateTags(["Exam"]));
    } catch (error) {
      console.error("Lỗi khi xóa nhiều bài thi:", error);
      toast.error("Đã xảy ra lỗi khi xóa bài thi. Vui lòng thử lại!");
    }
  };

  const { data: subjectsData } = useGetSubjectsQuery({ all: true });
  const subjects = subjectsData?.data || [];

  // Xử lý khi thay đổi chủ đề để xem danh sách bài thi
  const handleSubjectChange = async (event: SelectChangeEvent) => {
    const subjectId = event.target.value;
    const selectedSubject = subjects.find((s) => s.id === Number(subjectId));

    // Set loading state ngay lập tức khi chọn chủ đề
    setIsSubjectLoading(true);
    setSubject(subjectId === "" ? undefined : selectedSubject);

    try {
      if (subjectId === "") {
        // Nếu không chọn chủ đề, lấy tất cả bài thi
        await queryClient.invalidateQueries(["exams", page, limit]);
      } else {
        // Nếu chọn chủ đề, chỉ lấy bài thi theo chủ đề
        await queryClient.invalidateQueries(["exams", page, limit, subjectId]);
      }
    } finally {
      setIsSubjectLoading(false);
    }
  };

  const handleOpenPartModal = (exam: ExamType) => {
    setSelectedExamForPart(exam);
    setOpenModalPart(true);
  };

  const handleClosePartModal = () => {
    setOpenModalPart(false);
    setSelectedExamForPart(undefined);
  };

  const handlePartClick = (part: PartType) => {
    if (selectedExamForPart?.id) {
      navigate(
        `/exam/detail?examId=${selectedExamForPart.id}&partId=${part.id}`
      );
    }
  };

  // Mở modal part
  const [newPartName, setNewPartName] = useState("");
  const [modalPart, setModalPart] = useState(false);
  const [createPart] = useCreatePartMutation();

  const handleAddPart = async () => {
    try {
      const response = await createPart({ name: newPartName }).unwrap();
      console.log("Part created:", response);

      toast.success("Tạo part thành công!");
      setModalPart(false);
      setNewPartName("");
    } catch (error: any) {
      console.error("Error creating part:", error);
      toast.error(error?.data?.message || "Có lỗi xảy ra khi tạo part");
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Quản lý bài thi trực tuyến" />

      <ComponentCard title="">
        <div className="grid grid-cols-8 gap-4 mb-4">
          <FormControl fullWidth className="col-span-1">
            <InputLabel
              className="dark:text-white"
              id="demo-simple-select-label">
              Chủ đề
            </InputLabel>
            <Select
              labelId="subject-select-label"
              id="subject-select"
              value={subject ? String(subject.id) : ""}
              label="Chọn chủ đề"
              onChange={handleSubjectChange}>
              <MenuItem className="dark:text-white" value="">
                Tất cả chủ đề
              </MenuItem>
              {subjects?.map((subject: any) => (
                <MenuItem
                  key={subject.id}
                  value={subject.id}
                  className="dark:text-white">
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="col-span-5"></div>{" "}
          {/* Empty space between select and button */}
          <button
            onClick={() => {
              setSelectedExam(undefined);
              openModal();
            }}
            className="col-span-1 flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <IoIosAdd size={24} />
            Thêm
          </button>
          <button
            onClick={() => {
              setModalPart(true);
            }}
            className="col-span-1 flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <IoIosAdd size={24} />
            Add Part
          </button>
        </div>

        <div className="space-y-6">
          {isError ? (
            <div className="text-red-500">{(error as any).message}</div>
          ) : (
            <CommonTable
              error={errorDetail}
              setSelectedIds={setSelectedIds}
              selectedIds={selectedIds}
              title="Bảng"
              isLoading={isLoading || isSubjectLoading}
              columns={columns}
              pagination={{
                currentPage: page,
                pageSize: limit,
              }}
              onEdit={(row) => {
                setSelectedExam(row as any);
                openModal();
              }}
              actions={[
                {
                  icon: <IoIosAdd size={24} />,
                  label: "Danh sách câu hỏi",
                  onClick: (row) => handleOpenPartModal(row as ExamType),
                },
              ]}
              onDelete={(id) => handleBulkDelete(Number(id))}
              data={data?.data}
            />
          )}

          {totalPages > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel className="dark:text-white" id="limit-label">
                  Hiển thị
                </InputLabel>
                <Select
                  labelId="limit-label"
                  value={limit}
                  label="Hiển thị"
                  onChange={handleChangeLimit}>
                  <MenuItem value={5}>5 / trang</MenuItem>
                  <MenuItem value={10}>10 / trang</MenuItem>
                  <MenuItem value={20}>20 / trang</MenuItem>
                  <MenuItem value={50}>50 / trang</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
        </div>

        {/* Modal Part */}
        <Dialog
          open={openModalPart}
          onClose={handleClosePartModal}
          maxWidth="sm"
          fullWidth>
          <DialogTitle className="dark:text-white">
            Danh sách câu hỏi - {selectedExamForPart?.name}
          </DialogTitle>
          <DialogContent>
            <div className="mt-4 space-y-2">
              {isLoadingPart ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Đang tải danh sách part...
                </div>
              ) : parts && parts.length > 0 ? (
                parts.map((part) => (
                  <div
                    key={part.id}
                    onClick={() => handlePartClick(part)}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <span className="text-gray-700 dark:text-gray-300">
                      {part.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Edit part:", part);
                        }}
                        className="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Delete part:", part);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                        <RiDeleteBinLine className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Không có part nào
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePartModal} color="primary">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <ExamAction
          isOpen={isOpen}
          data={selectedExam}
          onCloseModal={closeModal}
          onSuccess={handleSuccess}
        />
      </ComponentCard>

      {/* Modal Part */}
      <Dialog
        open={modalPart}
        onClose={() => setModalPart(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Thêm Part mới</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Tên Part"
              variant="outlined"
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              fullWidth
              autoFocus
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalPart(false)} color="secondary">
            Hủy
          </Button>
          <Button
            onClick={handleAddPart}
            variant="contained"
            color="primary"
            disabled={!newPartName.trim() || isLoadingPart}>
            {isLoadingPart ? "Đang thêm..." : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExamPage;
