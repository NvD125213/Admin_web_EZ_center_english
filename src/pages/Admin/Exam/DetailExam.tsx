import { useState, useEffect, useMemo, memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useQueryString } from "../../../hooks/useQueryString";
import { IoIosAdd } from "react-icons/io";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import ActionDetailExam from "./ActionDetailExam";
import { useGetExamsQuery } from "../../../services/examServices";
import { useGetPartsQuery } from "../../../services/partServices";
import {
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
} from "../../../services/questionServices";

interface Question {
  title: string;
  description?: string;
  option: string[];
  correct_option: string;
  score: number;
  elements?: File[];
  global_order: number;
  display_order: number;
}

// Memoized Question Component
const QuestionItem = memo(
  ({
    question,
    onEdit,
    onDelete,
    index,
  }: {
    question: any;
    onEdit: (question: any) => void;
    onDelete: (question: any) => void;
    index: number;
  }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Media Content */}
        <div className="lg:w-2/5">
          {question.elements && question.elements.length > 0 && (
            <div className="space-y-4">
              {/* Images Section */}
              {question.elements.some((el: any) => el.type === "image") && (
                <div className="space-y-3">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-600 dark:text-gray-300">
                    Hình ảnh
                  </Typography>
                  <div className="grid grid-cols-2 gap-3">
                    {question.elements.map(
                      (element: any) =>
                        element.type === "image" && (
                          <div
                            key={element.id}
                            className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square">
                            <img
                              src={
                                element.cloudId
                                  ? element.url
                                  : `https://envidi.io.vn${element.url}`
                              }
                              alt="Question image"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                              loading="lazy"
                              onClick={() => {
                                // Open image in new tab for full view
                                window.open(
                                  element.cloudId
                                    ? element.url
                                    : `https://envidi.io.vn${element.url}`,
                                  "_blank"
                                );
                              }}
                            />
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Audio Section */}
              {question.elements.some((el: any) => el.type === "audio") && (
                <div className="space-y-3">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-600 dark:text-gray-300">
                    Âm thanh
                  </Typography>
                  <div className="space-y-3">
                    {question.elements.map(
                      (element: any) =>
                        element.type === "audio" && (
                          <div
                            key={element.id}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <audio controls className="w-full" preload="none">
                              <source
                                src={
                                  element.cloudId
                                    ? element.url
                                    : `https://envidi.io.vn${element.url}`
                                }
                                type="audio/mpeg"
                              />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Question Content */}
        <div className="lg:w-3/5 space-y-6">
          {/* Question Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  Câu {question.display_order}:
                </span>
                <p className="font-medium dark:text-white">{question.title}</p>
              </div>
              {question.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {question.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <IconButton
                onClick={() => onEdit(question)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                <FiEdit2 />
              </IconButton>
              <IconButton
                onClick={() => onDelete(question)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                <FiTrash2 />
              </IconButton>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Typography
              variant="subtitle2"
              className="text-gray-600 dark:text-gray-300">
              Các lựa chọn
            </Typography>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(question.option as Record<string, string>).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg transition-colors ${
                      key === question.correct_option
                        ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                        : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                    }`}>
                    <div className="flex items-start gap-3">
                      <span
                        className={`font-medium min-w-[24px] ${
                          key === question.correct_option
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}>
                        {key}.
                      </span>
                      <span className="text-gray-700 dark:text-gray-200">
                        {value}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Correct Answer */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <Typography
              variant="subtitle2"
              className="text-blue-600 dark:text-blue-400 mb-2">
              Đáp án đúng
            </Typography>
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {question.correct_option}.
              </span>
              <span className="text-gray-700 dark:text-gray-200">
                {
                  (question.option as Record<string, string>)[
                    question.correct_option
                  ]
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);

const DetailExam = () => {
  const queryString = useQueryString();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(Number(queryString.page) || 1);
  const [limit, setLimit] = useState(Number(queryString.limit) || 10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const examId = queryParams.get("examId");
  const partId = queryParams.get("partId");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);

  // Add effect to clear cache when examId or partId changes
  useEffect(() => {
    if (examId && partId) {
      queryClient.removeQueries(["questions", examId, partId]);
    }
  }, [examId, partId, queryClient]);

  // Fetch exam and part data
  const { data: examData, isLoading: isExamLoading } = useGetExamsQuery({
    all: true,
  });

  const { data: partData, isLoading: isPartLoading } = useGetPartsQuery();

  const exam = examData?.data?.find((e: any) => e.id === Number(examId));

  const part = partData?.find((p: any) => p.id === Number(partId));

  // Fetch questions data
  const { data, isLoading, isError } = useGetQuestionsQuery({
    examId: Number(examId),
    partId: Number(partId),
    page,
    limit,
  });

  // Memoize sorted questions
  const sortedQuestions = useMemo(() => {
    if (!data?.data) return [];
    return data.data
      .reduce((acc: any[], group: any) => [...acc, ...group.questions], [])
      .sort((a: any, b: any) => a.global_order - b.global_order);
  }, [data?.data]);

  // Handle pagination
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    navigate(`?examId=${examId}&partId=${partId}&page=${value}&limit=${limit}`);
  };

  const handleChangeLimit = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    setPage(1);
    navigate(`?examId=${examId}&partId=${partId}&page=1&limit=${newLimit}`);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(["questions", examId, partId]);
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleDeleteQuestion = (question: any) => {
    setQuestionToDelete(question);
    setIsDeleteDialogOpen(true);
  };

  const [deleteQuestionMutation] = useDeleteQuestionMutation();
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      await deleteQuestionMutation(questionToDelete.id);
      queryClient.invalidateQueries(["questions", examId, partId]);
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Xử lý thông tin các nhóm
  const [modalGroupData, setModalGroupData] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState<any>(null);

  const handleEditGroup = (group: any) => {
    setSelectedGroupData(group);
    setModalGroupData(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <PageBreadcrumb pageTitle={`Chi tiết bài thi`} />
        <Button
          variant="outlined"
          startIcon={<IoArrowBack />}
          onClick={() => navigate("/exam")}
          className="dark:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
          Quay lại
        </Button>
      </div>
      <span className="block text-sm text-gray-600 mb-2">
        {`${part?.name} - Bài thi ${exam?.name}`}
      </span>

      <ComponentCard title="" className="h-[calc(100vh-200px)] overflow-y-auto">
        <div className="flex justify-end mb-4 bg-white dark:bg-gray-800 z-10 py-2">
          <Button
            variant="contained"
            startIcon={<IoIosAdd />}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isExamLoading || isPartLoading}>
            Thêm câu hỏi
          </Button>
        </div>

        <div className="space-y-6">
          {isError ? (
            <div className="text-red-500">Đã xảy ra lỗi khi tải dữ liệu</div>
          ) : isLoading ? (
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có câu hỏi nào trong phần này
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sortedQuestions.map((question: any, index: number) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                    index={index}
                  />
                ))}
              </div>

              {data?.totalPages > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                  <Pagination
                    count={data.totalPages}
                    page={page}
                    onChange={handleChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel className="dark:text-white" id="limit-label">
                      Số lượng hiển thị
                    </InputLabel>
                    <Select
                      labelId="limit-label"
                      value={limit}
                      label="Số lượng hiển thị"
                      onChange={handleChangeLimit}>
                      <MenuItem value={5}>5 câu hỏi / trang</MenuItem>
                      <MenuItem value={10}>10 câu hỏi / trang</MenuItem>
                      <MenuItem value={20}>20 câu hỏi / trang</MenuItem>
                      <MenuItem value={50}>50 câu hỏi / trang</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              )}
            </>
          )}
        </div>
      </ComponentCard>

      {!isExamLoading && !isPartLoading && (
        <>
          <ActionDetailExam
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            examId={examId}
            partId={partId}
            examName={exam?.name || ""}
            partName={part?.name || ""}
            onSuccess={handleSuccess}
            mode="create"
          />
          <ActionDetailExam
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedQuestion(null);
            }}
            question={selectedQuestion}
            examId={examId}
            partId={partId}
            examName={exam?.name || ""}
            partName={part?.name || ""}
            onSuccess={handleSuccess}
            mode="edit"
          />
          <Dialog
            open={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setQuestionToDelete(null);
            }}>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogContent>
              <Typography>
                Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không
                thể hoàn tác.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setQuestionToDelete(null);
                }}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained">
                Xóa
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default DetailExam;
