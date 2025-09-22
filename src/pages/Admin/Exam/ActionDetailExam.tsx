import { useState, useEffect, use } from "react";
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
  useCloudinaryUploadSignatureQuery,
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
  const [updateQuestionMutation] = useUpdateQuestionMutation();
  const [createQuestionMutation] = useCreateQuestionMutation();
  const { refetch: refetchCloudinarySignature } =
    useCloudinaryUploadSignatureQuery({ examId, partId });

  // Sửa: handleSubmitCreate không nhận tham số, dùng trực tiếp biến scope
  const handleSubmitCreate = async () => {
    try {
      setIsSubmitting(true);

      // 1. Gọi backend để lấy signature
      const sigRes = await refetchCloudinarySignature();
      if (!sigRes.data) {
        toast.error("Không lấy được signature upload Cloudinary");
        return;
      }
      const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data;

      // 2. Upload files lên Cloudinary
      const uploadedGroupElements: { url: string; type: string }[] = [];
      if (group.elements && group.elements.length > 0) {
        for (const file of group.elements) {
          const formDataCloud = new FormData();
          formDataCloud.append("file", file);
          formDataCloud.append("api_key", apiKey);
          formDataCloud.append("timestamp", timestamp);
          formDataCloud.append("signature", signature);
          formDataCloud.append("folder", folder);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            { method: "POST", body: formDataCloud }
          );
          const data = await res.json();
          if (!data.secure_url) {
            console.error("Upload Cloudinary thất bại:", data);
            toast.error("Upload file lên Cloudinary thất bại!");
            continue; // bỏ qua file này
          }
          uploadedGroupElements.push({
            url: data.secure_url,
            type: file.type.startsWith("image") ? "image" : "audio",
          });
        }
      }

      // 3. Upload elements của từng question
      const questionsWithUploadedElements = await Promise.all(
        group.questions.map(async (question: any) => {
          const uploadedQuestionElements: { url: string; type: string }[] = [];
          if (question.elements && question.elements.length > 0) {
            for (const file of question.elements) {
              const formDataCloud = new FormData();
              formDataCloud.append("file", file);
              formDataCloud.append("api_key", apiKey);
              formDataCloud.append("timestamp", timestamp);
              formDataCloud.append("signature", signature);
              formDataCloud.append("folder", folder);

              const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                { method: "POST", body: formDataCloud }
              );
              const data = await res.json();
              if (!data.secure_url) {
                console.error("Upload Cloudinary thất bại:", data);
                toast.error("Upload file lên Cloudinary thất bại!");
                continue; // bỏ qua file này
              }
              uploadedQuestionElements.push({
                url: data.secure_url,
                type: file.type.startsWith("image") ? "image" : "audio",
              });
            }
          }
          return { ...question, elements: uploadedQuestionElements };
        })
      );

      // 4. Chuẩn bị payload gửi về server
      const payload = {
        title: group.title,
        description: group.description || "",
        type_group: group.type_group || 1,
        elements: uploadedGroupElements,
        questions: questionsWithUploadedElements,
      };
      console.log("Payload gửi lên backend:", payload);

      // 5. Gửi request tạo câu hỏi
      await createQuestionMutation({
        examId,
        partId,
        data: payload,
      }).unwrap();

      toast.success("Thêm câu hỏi thành công");
      onSuccess();
      onClose();
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
      // 1. Nếu có file mới, upload lên Cloudinary trước
      let uploadedElements: { url: string; type: string }[] = [];
      if (
        editedQuestion.elements &&
        editedQuestion.elements.length > 0 &&
        editedQuestion.elements[0] instanceof File
      ) {
        // Lấy signature
        const sigRes = await refetchCloudinarySignature();
        if (!sigRes.data) {
          toast.error("Không lấy được signature upload Cloudinary");
          setIsSubmitting(false);
          return;
        }
        const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data;
        for (const file of editedQuestion.elements) {
          const formDataCloud = new FormData();
          formDataCloud.append("file", file);
          formDataCloud.append("api_key", apiKey);
          formDataCloud.append("timestamp", timestamp);
          formDataCloud.append("signature", signature);
          formDataCloud.append("folder", folder);
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            { method: "POST", body: formDataCloud }
          );
          const data = await res.json();
          if (!data.secure_url) {
            console.error("Upload Cloudinary thất bại:", data);
            toast.error("Upload file lên Cloudinary thất bại!");
            continue;
          }
          uploadedElements.push({
            url: data.secure_url,
            type: file.type.startsWith("image") ? "image" : "audio",
          });
        }
      } else if (
        editedQuestion.elements &&
        editedQuestion.elements.length > 0
      ) {
        // Nếu là url cũ (không phải File), giữ nguyên
        uploadedElements = editedQuestion.elements;
      }

      // 2. Chuẩn bị payload
      const formData = {
        title: editedQuestion.title,
        description: editedQuestion.description || "",
        correct_option: editedQuestion.correct_option,
        score: editedQuestion.score,
        global_order: editedQuestion.global_order,
        option: Array.isArray(editedQuestion.option)
          ? editedQuestion.option.reduce(
              (acc: any, value: string, index: number) => {
                acc[String.fromCharCode(65 + index)] = value;
                return acc;
              },
              {}
            )
          : editedQuestion.option,
        elements: uploadedElements,
      };

      // 3. Gửi request update
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
