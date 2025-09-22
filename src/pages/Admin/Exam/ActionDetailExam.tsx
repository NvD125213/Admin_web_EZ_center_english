import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { IoIosAdd } from "react-icons/io";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from "../../../services/questionServices";
import toast from "react-hot-toast";

interface Question {
  title: string;
  description?: string;
  option: string[];
  correct_option: string;
  score: number;
  elements?: File[];
  global_order: number;
}

interface QuestionGroup {
  title: string;
  description?: string;
  type_group: number;
  questions: Question[];
  elements?: File[];
}

interface ActionDetailExamProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string | null;
  partId: string | null;
  examName: string;
  partName: string;
  onSuccess: () => void;
  mode: "create" | "edit";
  question?: any;
}

const ActionDetailExam = ({
  isOpen,
  onClose,
  examId,
  partId,
  examName,
  partName,
  onSuccess,
  mode,
  question,
}: ActionDetailExamProps) => {
  const [group, setGroup] = useState<QuestionGroup>({
    title: "",
    description: "",
    type_group: 1,
    questions: [
      {
        title: "",
        description: "",
        option: ["", "", "", ""],
        correct_option: "A",
        score: 1,
        elements: [],
        global_order: 1,
      },
    ],
    elements: [],
  });

  const [editedQuestion, setEditedQuestion] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && question) {
      setEditedQuestion({
        ...question,
        elements: question.elements || [],
      });
    }
  }, [mode, question]);

  const handleAddQuestion = () => {
    setGroup((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          title: "",
          description: "",
          option: ["", "", "", ""],
          correct_option: "A",
          score: 1,
          elements: [],
          global_order: prev.questions.length + 1,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setGroup((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    setGroup((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setGroup((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              option: q.option.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }));
  };

  const handleGroupFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setGroup((prev) => ({
        ...prev,
        elements: Array.from(files),
      }));
    }
  };

  const handleQuestionFileChange = (
    questionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setGroup((prev) => ({
        ...prev,
        questions: prev.questions.map((q, i) =>
          i === questionIndex ? { ...q, elements: Array.from(files) } : q
        ),
      }));
    }
  };

  const handleEditQuestionChange = (field: string, value: any) => {
    setEditedQuestion((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setEditedQuestion((prev: any) => ({
        ...prev,
        elements: Array.from(files),
      }));
    }
  };

  // Handle question submission
  const [createQuestionMutation] = useCreateQuestionMutation();
  const [updateQuestionMutation] = useUpdateQuestionMutation();

  const handleSubmitCreate = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      if (!group.title) {
        toast.error("Tiêu đề nhóm câu hỏi là bắt buộc");
        return;
      }

      formData.append("title", group.title);
      formData.append("description", group.description || "");
      formData.append("type_group", (group.type_group || 1).toString());

      const sanitizedExamName = examName.replace(/[^a-zA-Z0-9]/g, "_");
      const sanitizedPartName = partName.replace(/[^a-zA-Z0-9]/g, "_");
      formData.append("pathDir", `${sanitizedExamName}/${sanitizedPartName}`);

      if (group.elements && group.elements.length > 0) {
        group.elements.forEach((file: File) => {
          formData.append("elements", file);
        });
      }

      group.questions.forEach((q, i) => {
        formData.append(`questions[${i}][title]`, q.title);
        formData.append(`questions[${i}][description]`, q.description || "");
        formData.append(`questions[${i}][correct_option]`, q.correct_option);
        formData.append(`questions[${i}][score]`, Number(q.score).toString());
        formData.append(
          `questions[${i}][global_order]`,
          q.global_order.toString()
        );

        // Convert options array to key-value object
        const optionsObject = q.option.reduce(
          (acc: any, value: string, index: number) => {
            acc[String.fromCharCode(65 + index)] = value;
            return acc;
          },
          {}
        );
        formData.append(
          `questions[${i}][option]`,
          JSON.stringify(optionsObject)
        );

        if (q.elements && q.elements.length > 0) {
          q.elements.forEach((file: File) => {
            formData.append(`questions[${i}][elements]`, file);
          });
        }
      });

      const response = await createQuestionMutation({
        examId,
        partId,
        data: formData,
      });

      if (response) {
        toast.success("Thêm câu hỏi thành công");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Có lỗi xảy ra khi thêm câu hỏi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", editedQuestion.title);
      formData.append("description", editedQuestion.description || "");
      formData.append("correct_option", editedQuestion.correct_option);
      formData.append("score", editedQuestion.score.toString());
      formData.append("global_order", editedQuestion.global_order.toString());

      // Handle options - if it's already an object, use it directly, otherwise convert from array
      let optionsObject;
      if (Array.isArray(editedQuestion.option)) {
        optionsObject = editedQuestion.option.reduce(
          (acc: any, value: string, index: number) => {
            acc[String.fromCharCode(65 + index)] = value;
            return acc;
          },
          {}
        );
      } else {
        // If it's already an object, ensure it has the correct format
        optionsObject = {
          A: editedQuestion.option.A || "",
          B: editedQuestion.option.B || "",
          C: editedQuestion.option.C || "",
          D: editedQuestion.option.D || "",
        };
      }
      formData.append("option", JSON.stringify(optionsObject));

      if (editedQuestion.elements && editedQuestion.elements.length > 0) {
        editedQuestion.elements.forEach((file: File) => {
          formData.append("elements", file);
        });
      }

      const response = await updateQuestionMutation({
        examId,
        partId,
        questionId: editedQuestion.id,
        data: formData,
      });

      if (response) {
        toast.success("Cập nhật câu hỏi thành công");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật câu hỏi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCreateForm = () => (
    <div className="space-y-6 mt-4">
      <TextField
        fullWidth
        label="Tiêu đề nhóm câu hỏi"
        value={group.title}
        style={{ margin: "12px" }}
        InputProps={{ sx: { borderRadius: 0 } }}
        onChange={(e) =>
          setGroup((prev) => ({ ...prev, title: e.target.value }))
        }
      />
      <TextField
        fullWidth
        multiline
        rows={2}
        style={{ margin: "12px" }}
        InputProps={{ sx: { borderRadius: 0 } }}
        label="Mô tả nhóm câu hỏi"
        value={group.description}
        onChange={(e) =>
          setGroup((prev) => ({ ...prev, description: e.target.value }))
        }
      />

      <div className="space-y-2">
        <Typography style={{ marginLeft: "12px" }} variant="subtitle1">
          Tệp đính kèm nhóm câu hỏi
        </Typography>
        <input
          type="file"
          multiple
          accept="image/*,audio/*"
          onChange={handleGroupFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {group.elements && group.elements.length > 0 && (
          <Typography variant="caption" className="text-gray-500">
            Đã chọn {group.elements.length} tệp
          </Typography>
        )}
      </div>

      {group.questions.map((question, index) => (
        <Box key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <Typography style={{ margin: "12px" }} variant="h6">
              Câu hỏi {index + 1}
            </Typography>
            {group.questions.length > 1 && (
              <IconButton
                onClick={() => handleRemoveQuestion(index)}
                color="error">
                <RiDeleteBinLine />
              </IconButton>
            )}
          </div>

          <TextField
            fullWidth
            InputProps={{ sx: { borderRadius: 0 } }}
            label="Tiêu đề câu hỏi"
            value={question.title}
            sx={{ mb: 2 }}
            onChange={(e) =>
              handleQuestionChange(index, "title", e.target.value)
            }
          />
          <TextField
            fullWidth
            multiline
            InputProps={{ sx: { borderRadius: 0 } }}
            rows={2}
            label="Mô tả câu hỏi"
            value={question.description}
            sx={{ mb: 2 }}
            onChange={(e) =>
              handleQuestionChange(index, "description", e.target.value)
            }
          />

          <div className="space-y-2">
            {question.option.map((opt, optIndex) => (
              <TextField
                key={optIndex}
                InputProps={{ sx: { borderRadius: 0 } }}
                fullWidth
                label={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                value={opt}
                sx={{ mb: 2 }}
                onChange={(e) =>
                  handleOptionChange(index, optIndex, e.target.value)
                }
              />
            ))}
          </div>

          <div className="flex gap-4">
            <FormControl fullWidth>
              <InputLabel>Đáp án đúng</InputLabel>
              <Select
                value={question.correct_option}
                label="Đáp án đúng"
                onChange={(e) =>
                  handleQuestionChange(index, "correct_option", e.target.value)
                }>
                {question.option.map((_, i) => (
                  <MenuItem key={i} value={String.fromCharCode(65 + i)}>
                    {String.fromCharCode(65 + i)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Điểm"
              value={question.score}
              sx={{ mb: 2 }}
              onChange={(e) =>
                handleQuestionChange(index, "score", Number(e.target.value))
              }
              inputProps={{ min: 0 }}
            />
          </div>

          <div className="space-y-2">
            <Typography variant="subtitle2">Tệp đính kèm câu hỏi</Typography>
            <input
              type="file"
              multiple
              accept="image/*,audio/*"
              onChange={(e) => handleQuestionFileChange(index, e)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
            {question.elements && question.elements.length > 0 && (
              <Typography variant="caption" className="text-gray-500">
                Đã chọn {question.elements.length} tệp
              </Typography>
            )}
          </div>
        </Box>
      ))}

      <Button
        startIcon={<IoIosAdd />}
        onClick={handleAddQuestion}
        variant="outlined"
        fullWidth>
        Thêm câu hỏi
      </Button>
    </div>
  );

  const renderEditForm = () => {
    if (!editedQuestion) return null;

    // Convert options to array format for the form if it's an object
    const optionsArray = Array.isArray(editedQuestion.option)
      ? editedQuestion.option
      : [
          editedQuestion.option.A || "",
          editedQuestion.option.B || "",
          editedQuestion.option.C || "",
          editedQuestion.option.D || "",
        ];

    return (
      <div className="space-y-6 mt-4">
        <TextField
          fullWidth
          label="Tiêu đề câu hỏi"
          value={editedQuestion.title}
          onChange={(e) => handleEditQuestionChange("title", e.target.value)}
          InputProps={{ sx: { borderRadius: 0 } }}
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Mô tả câu hỏi"
          value={editedQuestion.description}
          onChange={(e) =>
            handleEditQuestionChange("description", e.target.value)
          }
          InputProps={{ sx: { borderRadius: 0 } }}
        />

        <div className="space-y-2">
          {optionsArray.map((value: string, index: number) => (
            <TextField
              key={index}
              fullWidth
              label={`Đáp án ${String.fromCharCode(65 + index)}`}
              value={value}
              sx={{ mb: 2 }}
              onChange={(e) => {
                // Update the options array
                const newOptions = [...optionsArray];
                newOptions[index] = e.target.value;
                handleEditQuestionChange("option", newOptions);
              }}
              InputProps={{ sx: { borderRadius: 0 } }}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <FormControl fullWidth>
            <InputLabel>Đáp án đúng</InputLabel>
            <Select
              value={editedQuestion.correct_option}
              label="Đáp án đúng"
              sx={{ mb: 2 }}
              onChange={(e) =>
                handleEditQuestionChange("correct_option", e.target.value)
              }>
              {["A", "B", "C", "D"].map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Điểm"
            value={editedQuestion.score}
            onChange={(e) =>
              handleEditQuestionChange("score", Number(e.target.value))
            }
            inputProps={{ min: 0 }}
          />
        </div>

        <div className="space-y-2">
          <Typography variant="subtitle2">Tệp đính kèm</Typography>
          <input
            type="file"
            multiple
            accept="image/*,audio/*"
            onChange={handleEditFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          {editedQuestion.elements && editedQuestion.elements.length > 0 && (
            <Typography variant="caption" className="text-gray-500">
              Đã chọn {editedQuestion.elements.length} tệp
            </Typography>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="dark:text-white">
        {mode === "create" ? "Thêm câu hỏi mới" : "Chỉnh sửa câu hỏi"}
      </DialogTitle>
      <DialogContent>
        {mode === "create" ? renderCreateForm() : renderEditForm()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={mode === "create" ? handleSubmitCreate : handleSubmitEdit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}>
          {isSubmitting
            ? "Đang xử lý..."
            : mode === "create"
            ? "Thêm"
            : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionDetailExam;
