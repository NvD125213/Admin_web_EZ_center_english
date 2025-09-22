import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useUpdateGroupQuestionMutation } from "../../../services/questionServices";

interface ActionGroupDetailExamProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string | null;
  partId: string | null;
  group?: any;
  onSuccess: () => void;
}

const ActionGroupDetailExam = ({
  isOpen,
  onClose,
  examId,
  partId,
  group,
  onSuccess,
}: ActionGroupDetailExamProps) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type_group: 1,
    elements: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateGroupMutation] = useUpdateGroupQuestionMutation();

  useEffect(() => {
    if (group) {
      setForm({
        title: group.title || "",
        description: group.description || "",
        type_group: group.type_group || 1,
        elements: [],
      });
    }
  }, [group]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({
        ...prev,
        elements: Array.from(e.target.files as any),
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type_group", String(form.type_group));
      if (form.elements.length > 0) {
        form.elements.forEach((file) => {
          formData.append("elements", file);
        });
      }

      await updateGroupMutation({
        examId,
        partId,
        groupId: group.id,
        data: formData,
      }).unwrap();

      toast.success("Cập nhật nhóm thành công");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật nhóm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chỉnh sửa nhóm câu hỏi</DialogTitle>
      <DialogContent className="space-y-4 mt-2">
        <TextField
          fullWidth
          label="Tiêu đề nhóm"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
        <TextField
          fullWidth
          label="Mô tả nhóm"
          multiline
          rows={2}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <Typography variant="subtitle2">Tệp đính kèm nhóm</Typography>
        <input
          type="file"
          multiple
          accept="image/*,audio/*"
          onChange={handleFileChange}
        />
        {form.elements.length > 0 && (
          <Typography variant="caption">
            Đã chọn {form.elements.length} tệp
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionGroupDetailExam;
